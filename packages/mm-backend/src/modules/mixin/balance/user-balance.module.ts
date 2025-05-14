import { Module } from '@nestjs/common';
import { UserBalanceService } from './user-balance.service';
import { UserBalanceController } from './user-balance.controller';
import { MixinIntegrationService } from '../../../integrations/mixin.integration.service';
import { MixinAuthModule } from '../auth/auth.module';

@Module({
  imports: [MixinAuthModule],
  controllers: [UserBalanceController],
  providers: [UserBalanceService, MixinIntegrationService],
  exports: [UserBalanceService],
})
export class UserBalanceModule {}
