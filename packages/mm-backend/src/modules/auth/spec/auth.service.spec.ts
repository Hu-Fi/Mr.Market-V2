import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import {
  adminLoginCommandFixture,
  adminLoginResponseFixture,
  mixinOAuthCommandFixture,
  mixinOAuthResponseFixture,
} from './auth.fixtures';
import { createHash } from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let mixinGateway: MixinGateway;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'ADMIN_PASSWORD':
                  return 'admin_password';
                case 'JWT_SECRET':
                  return 'jwt_secret';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mixinGateway = module.get<MixinGateway>(MixinGateway);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a JWT token if the password is valid', async () => {
      const command = adminLoginCommandFixture;
      const response = adminLoginResponseFixture;
      jest.spyOn(jwtService, 'sign').mockReturnValue(response.accessToken);

      const result = await service.validateUser(command);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'admin',
        roles: ['Admin'],
        sub: 'admin_id',
      });
      expect(result).toStrictEqual(response);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const command = adminLoginCommandFixture;
      command.password = 'invalidPassword';

      await expect(service.validateUser(command)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('mixinOauthHandler', () => {
    it('should call mixinGateway.oauthHandler if code length is valid', async () => {
      const command = mixinOAuthCommandFixture;
      const response = mixinOAuthResponseFixture;
      jest.spyOn(mixinGateway, 'oauthHandler').mockResolvedValue(response);

      const result = await service.mixinOauthHandler(command);

      expect(mixinGateway.oauthHandler).toHaveBeenCalledWith(command.code);
      expect(result).toBe(response);
    });

    it('should throw HttpException if code length is invalid', async () => {
      const command = mixinOAuthCommandFixture;
      command.code = 'short_code';

      await expect(service.mixinOauthHandler(command)).rejects.toThrow(
        new HttpException('Invalid code length', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
