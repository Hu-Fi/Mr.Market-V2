import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            mixinOauthHandler: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a JWT token if the password is correct', async () => {
      const password = 'valid_password';
      const token = 'jwt_token';
      jest.spyOn(authService, 'validateUser').mockResolvedValue(token);

      const result = await controller.login(password);

      expect(authService.validateUser).toHaveBeenCalledWith(password);
      expect(result).toBe(token);
    });
  });

  describe('oauth', () => {
    it('should handle OAuth and return an authorization ID', async () => {
      const code = 'valid_code';
      const authId = 'authorization_id';
      jest.spyOn(authService, 'mixinOauthHandler').mockResolvedValue(authId);

      const result = await controller.oauth(code);

      expect(authService.mixinOauthHandler).toHaveBeenCalledWith(code);
      expect(result).toBe(authId);
    });
  });
});
