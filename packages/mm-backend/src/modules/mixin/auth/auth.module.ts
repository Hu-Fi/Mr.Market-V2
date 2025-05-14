import { forwardRef, Module } from '@nestjs/common';
import { MixinAuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { MixinAuthSession } from '../../../common/entities/mixin-auth-session.entity';
import { UserModule } from '../../user/user.module';
import { MixinIntegrationService } from '../../../integrations/mixin.integration.service';
import { JwtStrategy } from '../../../common/utils/auth/jwt.strategy';
import { SecretGeneratorUtils } from '../../../common/utils/auth/secret-generator.utils';
import { EncryptionService } from '../../../common/utils/auth/encryption.service';
import { AuthSessionRepository } from './auth-session.repository';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([MixinAuthSession]),
    PassportModule,
  ],
  providers: [
    MixinAuthService,
    MixinIntegrationService,
    AuthSessionRepository,
    {
      provide: JwtStrategy,
      useFactory: async (secretGeneratorUtils: SecretGeneratorUtils) => {
        const secret = await secretGeneratorUtils.getOrGenerateSecret();
        return new JwtStrategy(secret);
      },
      inject: [SecretGeneratorUtils],
    },
    SecretGeneratorUtils,
    EncryptionService,
  ],
  exports: [MixinAuthService, AuthSessionRepository, SecretGeneratorUtils],
})
export class MixinAuthModule {}
