import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../../common/entities/transaction.entity';
import { Type } from '../../common/enums/transaction.enum';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}


  async save(param: { amount: number; currency: string; exchange: string; type: Type; userId: string }) {
    
  }
}
