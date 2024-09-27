import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WithdrawData } from '../../../common/interfaces/transaction.interfaces';
import { Withdraw } from '../../../common/entities/withdraw.entity';

@Injectable()
export class WithdrawRepository {
  constructor(
    @InjectRepository(Withdraw)
    private readonly repository: Repository<Withdraw>,
  ) {}

  async save(data: WithdrawData) {
    return await this.repository.save(data);
  }
}
