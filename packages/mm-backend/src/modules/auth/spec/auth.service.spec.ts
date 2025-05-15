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
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };

  const mockMixinAuthService = {
    getOauthLink: jest.fn(),
    mixinOauthHandler: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: MixinAuthService,
          useValue: mockMixinAuthService,
        },
        EncryptionService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            decode: jest.fn().mockReturnValue({
              sub: 'Admin',
              jti: 'mocked-jti',
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                ADMIN_PASSWORD: 'admin_password',
              };
              return config[key] || null;
            }),
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
