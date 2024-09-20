import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../../common/entities/transaction.entity';
import { TransactionData } from '../../common/interfaces/transaction.interfaces';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}

  async save(data: TransactionData) {
    return await this.repository.save(data);
  }
}
