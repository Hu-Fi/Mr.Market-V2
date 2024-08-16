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
      const password =
        '4d62e3a5d2be2c0320dddf7e0723d4cc23b0579085da8d9e27bef5d996aabc60';
      const token = 'jwt_token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await service.validateUser(password);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'admin',
        roles: ['Admin'],
        sub: 'admin_id',
      });
      expect(result).toBe(token);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const password = 'invalid_password';

      await expect(service.validateUser(password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('mixinOauthHandler', () => {
    it('should call mixinGateway.oauthHandler if code length is valid', async () => {
      const code = 'a'.repeat(64);
      const authId = 'authorization_id';
      jest.spyOn(mixinGateway, 'oauthHandler').mockResolvedValue(authId);

      const result = await service.mixinOauthHandler(code);

      expect(mixinGateway.oauthHandler).toHaveBeenCalledWith(code);
      expect(result).toBe(authId);
    });

    it('should throw HttpException if code length is invalid', async () => {
      const code = 'short_code';

      await expect(service.mixinOauthHandler(code)).rejects.toThrow(
        new HttpException('Invalid code length', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
