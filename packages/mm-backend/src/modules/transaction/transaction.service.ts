import { Injectable } from '@nestjs/common';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { UserBalanceService } from '../user-balance/user-balance.service';
import { UserBalance } from '../../common/entities/user-balance.entity';
import { Transactional } from 'typeorm-transactional';
import { TransactionRepository } from './transaction.repository';
import { Status, Type } from '../../common/enums/transaction.enum';
import { DepositCommand, WithdrawCommand } from './model/transaction.model';
import { DepositResponse } from '../../common/interfaces/transaction.interfaces';

@Injectable()
export class TransactionService {
  constructor(
    private readonly mixinGateway: MixinGateway,
    private readonly transactionRepository: TransactionRepository,
    private readonly userBalanceService: UserBalanceService,
  ) {}

  @Transactional()
  async deposit(command: DepositCommand): Promise<DepositResponse> {
    const destination = await this.mixinGateway.createDepositAddressForAssetId(command.assetId);
    await this.transactionRepository.save({
      ...command,
      type: Type.DEPOSIT,
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

  @Transactional()
  async withdraw(command: WithdrawCommand): Promise<UserBalance> {
    await this.transactionRepository.save({
      ...command,
      type: Type.WITHDRAWAL,
      status: Status.PENDING,
      destination: 'withdrawalAddress',
    })

    return await this.userBalanceService.updateUserBalance({
       ...command,
       amount: -command.amount,
      }
    );
  }
}
