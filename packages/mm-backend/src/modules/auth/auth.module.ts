import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { JwtStrategy } from '../../common/utils/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProfile } from './auth.mapper';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MixinAuthSession } from '../../common/entities/mixin-auth-session.entity';
import { AuthSessionRepository } from './auth-session.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([MixinAuthSession]),
  ],
  providers: [
    AuthService,
    MixinGateway,
    JwtStrategy,
    AuthProfile,
    AuthSessionRepository,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
