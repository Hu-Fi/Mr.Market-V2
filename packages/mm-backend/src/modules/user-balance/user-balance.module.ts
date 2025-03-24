import { Module } from '@nestjs/common';
import { UserBalanceService } from './user-balance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBalance } from '../../common/entities/user-balance.entity';
import { UserBalanceRepository } from './user-balance.repository';
import { UserBalanceController } from './user-balance.controller';
import { MixinIntegrationService } from '../../integrations/mixin.integration.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserBalance]), AuthModule],
  controllers: [UserBalanceController],
  providers: [
    UserBalanceService,
    UserBalanceRepository,
    MixinIntegrationService,
  ],
  exports: [UserBalanceService, UserBalanceRepository],
})
export class UserBalanceModule {}
