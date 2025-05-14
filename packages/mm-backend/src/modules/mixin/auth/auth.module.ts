import { forwardRef, Module } from '@nestjs/common';
import { MixinAuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MixinAuthSession } from '../../../common/entities/mixin-auth-session.entity';
import { UserModule } from '../../user/user.module';
import { MixinIntegrationService } from '../../../integrations/mixin.integration.service';
import { EncryptionService } from '../../../common/utils/auth/encryption.service';
import { AuthSessionRepository } from './auth-session.repository';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([MixinAuthSession]),
  ],
  providers: [
    MixinAuthService,
    MixinIntegrationService,
    AuthSessionRepository,
    EncryptionService,
  ],
  exports: [
    MixinAuthService,
    AuthSessionRepository
  ],
})
export class MixinAuthModule {}
