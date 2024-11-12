import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeWithdrawalData } from '../../../common/interfaces/transaction.interfaces';
import { ExchangeWithdrawal } from '../../../common/entities/exchange-withdrawal.entity';
import { ExchangeWithdrawalStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class ExchangeWithdrawalRepository {
  constructor(
    @InjectRepository(ExchangeWithdrawal)
    private readonly repository: Repository<ExchangeWithdrawal>,
  ) {}

  async save(data: ExchangeWithdrawalData) {
    return await this.repository.save(data);
  }

  async findWithdrawalsByStatus(status: ExchangeWithdrawalStatus) {
    return await this.repository.find({ where: { status } });
  }

  async updateStatusById(
    withdrawalId: number,
    status: ExchangeWithdrawalStatus,
  ) {
    return await this.repository.update({ id: withdrawalId }, { status });
  }

  async updateTransactionHashById(withdrawalId: number, txHash: string) {
    return await this.repository.update(
      { id: withdrawalId },
      { transactionHash: txHash },
    );
  }
}
