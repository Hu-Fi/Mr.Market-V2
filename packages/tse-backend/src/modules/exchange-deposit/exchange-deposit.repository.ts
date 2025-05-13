import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeDeposit } from '../../common/entities/exchange-deposit.entity';
import { ExchangeDepositData } from '../../common/interfaces/exchange-data.interfaces';

@Injectable()
export class ExchangeDepositRepository {
  constructor(
    @InjectRepository(ExchangeDeposit)
    private readonly repository: Repository<ExchangeDeposit>,
  ) {}

  async save(data: ExchangeDepositData) {
    return await this.repository.save(data);
  }

  async get(data: {
    exchangeName: string;
    symbol: string;
    userId: string;
    txTimestamp?: string;
    network: string;
  }): Promise<ExchangeDepositData[]> {
    return await this.repository.find(
      {
        where: data,
      },
    )
  }
}
