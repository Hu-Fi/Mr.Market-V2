import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MixinWithdrawalData } from '../../../common/interfaces/transaction.interfaces';
import { MixinWithdrawal } from '../../../common/entities/mixin-withdrawal.entity';
import { MixinWithdrawalStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class MixinWithdrawalRepository {
  constructor(
    @InjectRepository(MixinWithdrawal)
    private readonly repository: Repository<MixinWithdrawal>,
  ) {}

  async save(data: MixinWithdrawalData) {
    return await this.repository.save(data);
  }

  async findWithdrawalsByStatus(status: MixinWithdrawalStatus) {
    return await this.repository.find({ where: { status } });
  }

  async updateStatusById(withdrawalId: number, status: MixinWithdrawalStatus) {
    return await this.repository.update({ id: withdrawalId }, { status });
  }

  async updateTransactionHashById(withdrawalId: number, txHash: string) {
    return await this.repository.update(
      { id: withdrawalId },
      { transactionHash: txHash },
    );
  }
}
