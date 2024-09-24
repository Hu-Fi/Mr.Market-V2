import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionData } from '../../common/interfaces/transaction.interfaces';
import { Deposit } from '../../common/entities/deposit.entity';

@Injectable()
export class DepositRepository {
  constructor(
    @InjectRepository(Deposit)
    private readonly repository: Repository<Deposit>,
  ) {}

  async save(data: TransactionData) {
    return await this.repository.save(data);
  }
}
