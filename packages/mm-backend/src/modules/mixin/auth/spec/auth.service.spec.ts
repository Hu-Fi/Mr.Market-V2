import { BadRequestException } from '@nestjs/common';
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

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('00fcc4f4-8703-44ba-8d14-f5ef02a3b8a1'),
}));

describe('AuthService', () => {
  let service: MixinAuthService;
  let mixinGateway: MixinIntegrationService;

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
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                MIXIN_APP_ID: 'id',
                MIXIN_OAUTH_SCOPE: 'scope',
              };
              return config[key] || null;
            }),
          },
        },
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn().mockImplementation((dto) => {
              return Promise.resolve({
                userId: '00fcc4f4-8703-44ba-8d14-f5ef02a3b8a1',
                ...dto,
              });
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MixinAuthService>(MixinAuthService);
    mixinGateway = module.get<MixinIntegrationService>(MixinIntegrationService);
  });

  describe('mixinOauthHandler', () => {
    it('should call mixinGateway.oauthHandler and return JWT token', async () => {
      const command = mixinOAuthCommandFixture;
      const response = mixinOAuthResponseFixture;
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
