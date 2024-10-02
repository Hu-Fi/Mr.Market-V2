import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepositData } from '../../../common/interfaces/transaction.interfaces';
import { Deposit } from '../../../common/entities/deposit.entity';
import { DepositStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class DepositRepository {
  constructor(
    @InjectRepository(Deposit)
    private readonly repository: Repository<Deposit>,
  ) {}

  async save(data: DepositData) {
    return await this.repository.save(data);
  }

  async findByStatus(status: DepositStatus) {
    return await this.repository.find({ where: { status } });
  }

  async updateStatusById(depositId: number, status: DepositStatus) {
    return await this.repository.update({ id: depositId }, { status });
  }

  async updateTransactionHashById(depositId: number, txHash: string) {
    return await this.repository.update({ id: depositId }, { transactionHash: txHash });
  }
}
