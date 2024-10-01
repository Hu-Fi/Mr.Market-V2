import { Injectable } from '@nestjs/common';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { Transactional } from 'typeorm-transactional';
import { DepositRepository } from './deposit.repository';
import { DepositCommand } from './model/deposit.model';
import { DepositResponse } from '../../../common/interfaces/transaction.interfaces';
import { Deposit } from '../../../common/entities/deposit.entity';
import { DepositStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class DepositService {
  constructor(
    private readonly mixinGateway: MixinGateway,
    private readonly repository: DepositRepository,
  ) {}

  @Transactional()
  async deposit(command: DepositCommand): Promise<DepositResponse> {
    const destination = await this.mixinGateway.createDepositAddress(command)
    await this.repository.save({
      ...command,
      status: DepositStatus.PENDING,
      destination,
    });

    return {
      assetId: command.assetId,
      amount: command.amount,
      destination: destination,
    } as DepositResponse
  }

  async getPendingDeposits(): Promise<Deposit[]> {
    return await this.repository.findByStatus(DepositStatus.PENDING);
  }

  async updateDepositStatus(depositId: number, status: DepositStatus) {
    await this.repository.updateStatusById(depositId, status);
  }

  async updateDepositTransactionHash(depositId: number, txHash: string) {
    await this.repository.updateTransactionHashById(depositId, txHash);
  }
}
