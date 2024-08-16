import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MockController } from './mockController';
import { RolesGuard } from '../../../common/utils/auth/guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { JwtAuthGuard } from '../../../common/utils/auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../../../common/utils/auth/jwt.strategy';

describe('RolesGuard', () => {
  let app: INestApplication;
  let authService: AuthService;
  let token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ JWT_SECRET: 'secret', ADMIN_PASSWORD: 'pass' })],
        }),
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: '60m' },
        }),
      ],
      controllers: [MockController],
      providers: [
        Reflector,
        AuthService,
        JwtStrategy,
        {
          provide: 'APP_GUARD',
          useClass: JwtAuthGuard,
        },
        RolesGuard,
        {
          provide: MixinGateway,
          useValue: {},
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    const authService = module.get<AuthService>(AuthService);
    token = await authService.validateUser(
      '73899d2adaad774417b0208da85162b61c8dbdf79bb0f7108c2686b93721d1f4',
    );
  });

  it('should deny access if no role is provided', () => {
    return request(app.getHttpServer()).get('/test/admin').expect(401);
  });

  it('should allow access if admin role is provided', () => {
    return request(app.getHttpServer())
      .get('/test/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('This is the admin endpoint');
  });

  afterAll(async () => {
    await app.close();
  });
});
