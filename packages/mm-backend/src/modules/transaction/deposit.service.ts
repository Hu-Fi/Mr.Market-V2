import { Injectable } from '@nestjs/common';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { UserBalanceService } from '../user-balance/user-balance.service';
import { Transactional } from 'typeorm-transactional';
import { DepositRepository } from './deposit.repository';
import { Status } from '../../common/enums/deposit.enum';
import { DepositCommand } from './model/transaction.model';
import { DepositResponse } from '../../common/interfaces/transaction.interfaces';

@Injectable()
export class DepositService {
  constructor(
    private readonly mixinGateway: MixinGateway,
    private readonly transactionRepository: DepositRepository,
    private readonly userBalanceService: UserBalanceService,
  ) {}

  @Transactional()
  async deposit(command: DepositCommand): Promise<DepositResponse> {
    const destination = await this.mixinGateway.getDepositAddress(command)
    await this.transactionRepository.save({
      ...command,
      status: Status.PENDING,
      destination,
    });

    await this.userBalanceService.updateUserBalance(command);

    return {
      assetId: command.assetId,
      amount: command.amount,
      destination: destination,
    } as DepositResponse
  }
}
