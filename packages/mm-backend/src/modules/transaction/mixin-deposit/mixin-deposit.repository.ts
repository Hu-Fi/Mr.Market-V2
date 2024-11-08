import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MixinDepositData } from '../../../common/interfaces/transaction.interfaces';
import { MixinDeposit } from '../../../common/entities/mixin-deposit.entity';
import { MixinDepositStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class MixinDepositRepository {
  constructor(
    @InjectRepository(MixinDeposit)
    private readonly repository: Repository<MixinDeposit>,
  ) {}

  async save(data: MixinDepositData) {
    return await this.repository.save(data);
  }

  async findByStatus(status: MixinDepositStatus) {
    return await this.repository.find({ where: { status } });
  }

  async updateStatusById(depositId: number, status: MixinDepositStatus) {
    return await this.repository.update({ id: depositId }, { status });
  }

  async updateTransactionHashById(depositId: number, txHash: string) {
    return await this.repository.update(
      { id: depositId },
      { transactionHash: txHash },
    );
  }
}
