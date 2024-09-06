import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MockController } from './mockController';
import { RolesGuard } from '../../../common/utils/auth/guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { JwtAuthGuard } from '../../../common/utils/auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../../../common/utils/auth/jwt.strategy';
import { adminLoginCommandFixture } from './auth.fixtures';
import { AdminLoginResponse } from '../model/auth.model';

describe('RolesGuard', () => {
  let app: INestApplication;
  let authService: AuthService;
  let adminLoginResponse: AdminLoginResponse;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
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
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'ADMIN_PASSWORD':
                  return 'admin_password';
                case 'JWT_SECRET':
                  return 'secret';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    const authService = module.get<AuthService>(AuthService);
    const command = adminLoginCommandFixture;
    adminLoginResponse = await authService.validateUser(command);
  });

  it('should allow access if admin role is provided', () => {
    return request(app.getHttpServer())
      .get('/test/admin')
      .set('Authorization', `Bearer ${adminLoginResponse.accessToken}`)
      .expect(200)
      .expect('This is the admin endpoint');
  });

  it('should allow access to user endpoint for admins', async () => {
    return request(app.getHttpServer())
      .get('/test/user')
      .set('Authorization', `Bearer ${adminLoginResponse.accessToken}`)
      .expect(200)
      .expect('This is the user endpoint');
  });

  it('should deny access if no role is provided', () => {
    return request(app.getHttpServer()).get('/test/admin').expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
