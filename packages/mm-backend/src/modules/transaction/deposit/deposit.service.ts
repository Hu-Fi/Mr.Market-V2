import { Injectable } from '@nestjs/common';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { UserBalanceService } from '../../user-balance/user-balance.service';
import { Transactional } from 'typeorm-transactional';
import { DepositRepository } from './deposit.repository';
import { Status } from '../../../common/enums/transaction.enum';
import { DepositCommand } from './model/deposit.model';
import { DepositResponse } from '../../../common/interfaces/transaction.interfaces';
import { Deposit } from '../../../common/entities/deposit.entity';

@Injectable()
export class DepositService {
  constructor(
    private readonly mixinGateway: MixinGateway,
    private readonly repository: DepositRepository,
    private readonly userBalanceService: UserBalanceService,
  ) {}

  @Transactional()
  async deposit(command: DepositCommand): Promise<DepositResponse> {
    const destination = await this.mixinGateway.getDepositAddress(command)
    await this.repository.save({
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

  async getPendingDeposits(): Promise<Deposit[]> {
    return await this.repository.getByStatus(Status.PENDING);
  }

  async updateDepositStatus(depositId: number, status: Status) {
    await this.repository.update(depositId, status);
  }
}
