import { Injectable } from '@nestjs/common';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { UserBalanceService } from '../../user-balance/user-balance.service';
import { Transactional } from 'typeorm-transactional';
import { Status } from '../../../common/enums/transaction.enum';
import { WithdrawResponse } from '../../../common/interfaces/transaction.interfaces';
import { WithdrawCommand } from './model/withdraw.model';
import { WithdrawRepository } from './withdraw.repository';

@Injectable()
export class WithdrawService {
  constructor(
    private readonly mixinGateway: MixinGateway,
    private readonly repository: WithdrawRepository,
    private readonly userBalanceService: UserBalanceService,
  ) {}

  @Transactional()
  async withdraw(command: WithdrawCommand): Promise<any> {
    await this.repository.save({
      ...command,
      status: Status.PENDING,
    });

    await this.userBalanceService.updateUserBalance({
      ...command,
      amount: -command.amount
    });

    const withdrawalResult = await this.mixinGateway.handleWithdrawal(command);

    return {
      transactionHash: withdrawalResult.transaction_hash,
      snapshotId: withdrawalResult.snapshot_id,
    } as WithdrawResponse
  }
}
