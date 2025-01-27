import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MixinIntegrationService } from '../../integrations/mixin.integration.service';
import { ConfigModule } from '@nestjs/config';
import { AuthProfile } from './auth.mapper';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MixinAuthSession } from '../../common/entities/mixin-auth-session.entity';
import { AuthSessionRepository } from './auth-session.repository';
import { SecretGeneratorUtils } from '../../common/utils/auth/secret-generator.utils';
import { JwtStrategy } from '../../common/utils/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([MixinAuthSession]),
    PassportModule,
  ],
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
    AuthSessionRepository,
    SecretGeneratorUtils,
  ],
  exports: [AuthService, SecretGeneratorUtils],
  controllers: [AuthController],
})
export class AuthModule {}
