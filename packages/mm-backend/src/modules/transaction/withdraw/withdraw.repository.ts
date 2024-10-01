import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WithdrawData } from '../../../common/interfaces/transaction.interfaces';
import { Withdraw } from '../../../common/entities/withdraw.entity';
import { WithdrawalStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class WithdrawRepository {
  constructor(
    @InjectRepository(Withdraw)
    private readonly repository: Repository<Withdraw>,
  ) {}

  async save(data: WithdrawData) {
    return await this.repository.save(data);
  }

  async findWithdrawalsByStatus(status: WithdrawalStatus) {
    return await this.repository.find({ where: { status } });
  }

  async updateStatusById(withdrawalId: number, status: WithdrawalStatus) {
    return await this.repository.update({ id: withdrawalId }, { status });
  }

  async updateTransactionHashById(withdrawalId: number, txHash: string) {
    return await this.repository.update({ id: withdrawalId }, { transactionHash: txHash });
  }
}
