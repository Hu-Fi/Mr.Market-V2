import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
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
import {
  adminLoginCommandFixture,
  mixinOAuthCommandFixture,
  oauthResponseFixture,
} from './auth.fixtures';
import { JwtResponse } from '../../../common/interfaces/auth.interfaces';
import { UserService } from '../../user/user.service';
import { AuthSessionRepository } from '../auth-session.repository';

describe('RolesGuard', () => {
  let app: INestApplication;
  let adminLoginResponse: JwtResponse;
  let userLoginResponse: JwtResponse;

  const mockAuthSessionRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockUserService = {
    createUser: jest.fn(),
  };

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
        {
          provide: 'APP_GUARD',
          useClass: JwtAuthGuard,
        },
        JwtStrategy,
        AuthService,
        RolesGuard,
        {
          provide: MixinGateway,
          useValue: {
            oauthHandler: jest.fn().mockReturnValue(oauthResponseFixture),
          },
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
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthSessionRepository,
          useValue: mockAuthSessionRepository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    const authService = module.get<AuthService>(AuthService);

    jest.spyOn(authService, 'saveUserToDatabase').mockResolvedValue(undefined);
    jest.spyOn(authService, 'findAndUpdateAuthId').mockResolvedValue(undefined);

    adminLoginResponse = await authService.validateUser(
      adminLoginCommandFixture,
    );
    userLoginResponse = await authService.mixinOauthHandler(
      mixinOAuthCommandFixture,
    );
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

  it('should deny access if user without admin role tries to access admin endpoint', () => {
    return request(app.getHttpServer())
      .get('/test/admin')
      .set('Authorization', `Bearer ${userLoginResponse.accessToken}`)
      .expect(403);
  });

  it('should allow access to user endpoint for regular users', () => {
    return request(app.getHttpServer())
      .get('/test/user')
      .set('Authorization', `Bearer ${userLoginResponse.accessToken}`)
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
