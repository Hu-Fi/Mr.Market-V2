import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserBalance } from '../../common/entities/user-balance.entity';

@Injectable()
export class UserBalanceRepository {
  constructor(
    @InjectRepository(UserBalance)
    private readonly repository: Repository<UserBalance>,
  ) {}

  async findByUserIdExchangeCurrency(
    userId: string,
    exchange: string,
    currency: string,
  ): Promise<UserBalance | null> {
    return this.repository.findOne({
      where: { userId, exchange, currency },
    });
  }

  async saveUserBalance(userBalance: UserBalance): Promise<UserBalance> {
    return this.repository.save(userBalance);
  }
}
