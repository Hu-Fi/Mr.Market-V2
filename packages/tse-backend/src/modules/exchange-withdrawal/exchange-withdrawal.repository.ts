import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeWithdrawal } from '../../common/entities/exchange-withdrawal.entity';
import { ExchangeWithdrawalData } from '../../common/interfaces/exchange-data.interfaces';

@Injectable()
export class ExchangeWithdrawalRepository {
  constructor(
    @InjectRepository(ExchangeWithdrawal)
    private readonly repository: Repository<ExchangeWithdrawal>,
  ) {}

  async save(data: ExchangeWithdrawalData) {
    return await this.repository.save(data);
  }

  async get(data: {
    exchangeName: string;
    symbol: string;
    userId: string;
    txTimestamp?: string;
    network: string;
  }): Promise<ExchangeWithdrawalData[]> {
    return await this.repository.find({
      where: data,
    });
  }
}
