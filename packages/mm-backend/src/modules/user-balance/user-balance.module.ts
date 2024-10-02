import { Module } from '@nestjs/common';
import { UserBalanceService } from './user-balance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBalance } from '../../common/entities/user-balance.entity';
import { UserBalanceRepository } from './user-balance.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserBalance])],
  providers: [UserBalanceService, UserBalanceRepository],
  exports: [UserBalanceService, UserBalanceRepository],
})
export class UserBalanceModule {}
