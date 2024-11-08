import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeDepositData } from '../../../common/interfaces/transaction.interfaces';
import { ExchangeDepositStatus } from '../../../common/enums/transaction.enum';
import { ExchangeDeposit } from '../../../common/entities/exchange-deposit.entity';

@Injectable()
export class ExchangeDepositRepository {
  constructor(
    @InjectRepository(ExchangeDeposit)
    private readonly repository: Repository<ExchangeDeposit>,
  ) {}

  async save(data: ExchangeDepositData) {
    return await this.repository.save(data);
  }

  async findByStatus(status: ExchangeDepositStatus) {
    return await this.repository.find({ where: { status } });
  }

  async updateStatusById(depositId: number, status: ExchangeDepositStatus) {
    return await this.repository.update({ id: depositId }, { status });
  }

  async updateTransactionHashById(depositId: number, txHash: string) {
    return await this.repository.update(
      { id: depositId },
      { transactionHash: txHash },
    );
  }
}
