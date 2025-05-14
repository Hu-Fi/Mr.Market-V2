import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MixinIntegrationService } from '../../integrations/mixin.integration.service';
import { ConfigModule } from '@nestjs/config';
import { AuthProfile } from './auth.mapper';
import { SecretGeneratorUtils } from '../../common/utils/auth/secret-generator.utils';
import { JwtStrategy } from '../../common/utils/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { EncryptionService } from '../../common/utils/auth/encryption.service';
import { MixinAuthModule } from '../mixin/auth/auth.module';

@Module({
  imports: [ConfigModule, PassportModule, MixinAuthModule],
  providers: [
    AuthService,
    MixinIntegrationService,
    {
      provide: JwtStrategy,
      useFactory: async (secretGeneratorUtils: SecretGeneratorUtils) => {
        const secret = await secretGeneratorUtils.getOrGenerateSecret();
        return new JwtStrategy(secret);
      },
      inject: [SecretGeneratorUtils],
    },
    AuthProfile,
    SecretGeneratorUtils,
    EncryptionService,
  ],
  exports: [AuthService, SecretGeneratorUtils],
  controllers: [AuthController],
})
export class AuthModule {}
