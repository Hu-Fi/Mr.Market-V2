import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { MixinIntegrationService } from '../../../integrations/mixin.integration.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../../common/entities/user.entity';
import { Role } from '../../../common/enums/role.enum';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: MixinIntegrationService,
          useValue: {
            fetchUserBalanceDetails: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getMixinUserAuthSession: jest.fn(),
          },
        },
      ],
    }).compile();

    service = testingModule.get<UserService>(UserService);
    repository = testingModule.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should call repository.create with the correct user data', async () => {
      const user: Partial<User> = {
        userId: 'some-uuid',
        role: Role.USER,
        type: 'type',
      };

      jest.spyOn(repository, 'create').mockResolvedValue(undefined);

      await service.createUser(user);

      expect(repository.create).toHaveBeenCalledWith(user);
      expect(repository.create).toHaveBeenCalledTimes(1);
    });
  });
});
