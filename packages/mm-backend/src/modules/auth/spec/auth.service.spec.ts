import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  adminLoginCommandFixture,
  adminLoginResponseFixture,
  mixinOAuthCommandFixture,
  mixinOAuthResponseFixture,
  oauthResponseFixture,
} from './auth.fixtures';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { AuthSessionRepository } from '../auth-session.repository';

describe('AuthService', () => {
  let service: AuthService;
  let mixinGateway: MixinGateway;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockAuthSessionRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthSessionRepository,
          useValue: mockAuthSessionRepository,
        },
        {
          provide: MixinGateway,
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
    mixinGateway = module.get<MixinGateway>(MixinGateway);
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
        sub: 'admin',
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
