import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { User } from '../../../common/entities/user.entity';
import { Role } from '../../../common/enums/role.enum';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
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
        identityNumber: '12345',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.png',
      };

      jest.spyOn(repository, 'create').mockResolvedValue(undefined);

      await service.createUser(user);

      expect(repository.create).toHaveBeenCalledWith(user);
      expect(repository.create).toHaveBeenCalledTimes(1);
    });
  });
});
