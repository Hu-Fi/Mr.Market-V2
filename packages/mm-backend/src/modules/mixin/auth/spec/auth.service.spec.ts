import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mixinOAuthCommandFixture,
  mixinOAuthResponseFixture,
  oauthResponseFixture,
} from './auth.fixtures';
import { ConfigService } from '@nestjs/config';
import { AuthSessionRepository } from '../auth-session.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MixinAuthService } from '../auth.service';
import { MixinIntegrationService } from '../../../../integrations/mixin.integration.service';
import { EncryptionService } from '../../../../common/utils/auth/encryption.service';
import { UserService } from '../../../user/user.service';

describe('AuthService', () => {
  let service: MixinAuthService;
  let mixinGateway: MixinIntegrationService;
  let jwtService: JwtService;

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MixinAuthService,
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

    service = module.get<MixinAuthService>(MixinAuthService);
    mixinGateway = module.get<MixinIntegrationService>(MixinIntegrationService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('mixinOauthHandler', () => {
    it('should call mixinGateway.oauthHandler and return JWT token', async () => {
      const command = mixinOAuthCommandFixture;
      const response = mixinOAuthResponseFixture;
      jest.spyOn(jwtService, 'sign').mockReturnValue(response.accessToken);
      jest
        .spyOn(mixinGateway, 'oauthHandler')
        .mockResolvedValue(oauthResponseFixture);

      const result = await service.mixinOauthHandler(command);

      expect(mixinGateway.oauthHandler).toHaveBeenCalledWith(command.code);
      expect(result).toStrictEqual(response);
    });

    it('should throw BadRequestException if code is invalid', async () => {
      const command = { ...mixinOAuthCommandFixture, code: 'short_code' };

      await expect(service.mixinOauthHandler(command)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
