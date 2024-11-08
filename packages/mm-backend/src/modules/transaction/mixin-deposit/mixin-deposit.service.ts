import { Injectable } from '@nestjs/common';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { Transactional } from 'typeorm-transactional';
import { MixinDepositRepository } from './mixin-deposit.repository';
import { DepositCommand } from './model/mixin-deposit.model';
import { MixinDepositResponse } from '../../../common/interfaces/transaction.interfaces';
import { MixinDeposit } from '../../../common/entities/mixin-deposit.entity';
import { MixinDepositStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class MixinDepositService {
  constructor(
    private readonly mixinGateway: MixinGateway,
    private readonly repository: MixinDepositRepository,
  ) {}

  @Transactional()
  async deposit(command: DepositCommand): Promise<MixinDepositResponse> {
    const destination = await this.mixinGateway.createDepositAddress(command);
    await this.repository.save({
      ...command,
      status: MixinDepositStatus.PENDING,
      destination,
    });

    return {
      assetId: command.assetId,
      amount: command.amount,
      destination: destination,
    } as MixinDepositResponse;
  }

  async getPendingDeposits(): Promise<MixinDeposit[]> {
    return await this.repository.findByStatus(MixinDepositStatus.PENDING);
  }

  async updateDepositStatus(depositId: number, status: MixinDepositStatus) {
    await this.repository.updateStatusById(depositId, status);
  }

  async updateDepositTransactionHash(depositId: number, txHash: string) {
    await this.repository.updateTransactionHashById(depositId, txHash);
  }
}
