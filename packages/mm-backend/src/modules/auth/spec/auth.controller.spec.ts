import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import {
  adminLoginCommandFixture,
  adminLoginDtoFixture,
  adminLoginResponseFixture,
  mixinOAuthCommandFixture,
  mixinOAuthDtoFixture,
  mixinOAuthResponseFixture,
} from './auth.fixtures';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { AuthProfile } from '../auth.mapper';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            mixinOauthHandler: jest.fn(),
          },
        },
        AuthProfile,
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
      const dto = adminLoginDtoFixture;
      const command = adminLoginCommandFixture;
      const response = adminLoginResponseFixture;
      jest.spyOn(authService, 'validateUser').mockResolvedValue(response);

      const result = await controller.login(dto);

      expect(authService.validateUser).toHaveBeenCalledWith(command);
      expect(result).toBe(response);
    });
  });

  describe('oauth', () => {
    it('should handle OAuth and return an authorization ID', async () => {
      const dto = mixinOAuthDtoFixture;
      const command = mixinOAuthCommandFixture;
      const response = mixinOAuthResponseFixture;
      jest.spyOn(authService, 'mixinOauthHandler').mockResolvedValue(response);

      const result = await controller.oauth(dto);

      expect(authService.mixinOauthHandler).toHaveBeenCalledWith(command);
      expect(result).toBe(response);
    });
  });
});
