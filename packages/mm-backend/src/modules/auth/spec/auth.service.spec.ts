import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  adminLoginCommandFixture,
  adminLoginResponseFixture,
} from './auth.fixtures';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '../../../common/utils/auth/encryption.service';
import { MixinAuthService } from '../../mixin/auth/auth.service';
import { MixinIntegrationService } from '../../../integrations/mixin.integration.service';
import { UserService } from '../../user/user.service';
import { AuthSessionRepository } from '../../mixin/auth/auth-session.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockAuthSessionRepository = {
    findByUserId: jest.fn(),
    findAuthSessionByClientId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        MixinAuthService,
        EncryptionService,
        EncryptionService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },

        {
          provide: AuthSessionRepository,
          useValue: mockAuthSessionRepository,
        },
        {
          provide: MixinIntegrationService,
          useValue: {
            oauthHandler: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                ADMIN_PASSWORD: 'admin_password',
                JWT_SECRET: 'jwt_secret',
              };
              return config[key] || null;
            }),
          },
        },
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return a JWT token if password is valid', async () => {
      const command = adminLoginCommandFixture;
      const response = adminLoginResponseFixture;
      jest.spyOn(jwtService, 'sign').mockReturnValue(response.accessToken);

      const result = await service.validateUser(command);

      expect(jwtService.sign).toHaveBeenCalledWith({
        roles: ['Admin'],
        clientId: 'Admin',
        sub: 'Admin',
      });
      expect(result).toStrictEqual(response);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const command = { ...adminLoginCommandFixture, password: 'invalid' };

      await expect(service.validateUser(command)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
