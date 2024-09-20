import { Injectable } from '@nestjs/common';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { UserBalanceService } from '../user-balance/user-balance.service';
import { UserBalance } from '../../common/entities/user-balance.entity';
import { Transactional } from 'typeorm-transactional';
import { TransactionRepository } from './transaction.repository';
import { Type } from '../../common/enums/transaction.enum';
import { DepositCommand, WithdrawCommand } from './model/transaction.model';

@Injectable()
export class TransactionService {
  constructor(
    private readonly mixinGateway: MixinGateway,
    private readonly transactionRepository: TransactionRepository,
    private readonly userBalanceService: UserBalanceService,
  ) {}

  @Transactional()
  async deposit(command: DepositCommand): Promise<UserBalance> {
    await this.transactionRepository.save({
      ...command,
      type: Type.DEPOSIT,
    });

    return await this.userBalanceService.updateUserBalance(command);
  }

  @Transactional()
  async withdraw(command: WithdrawCommand): Promise<UserBalance> {
    await this.transactionRepository.save({
      ...command,
      type: Type.WITHDRAWAL,
    })

    return await this.userBalanceService.updateUserBalance({
       ...command,
       amount: -command.amount,
      }
    );
  }
}
