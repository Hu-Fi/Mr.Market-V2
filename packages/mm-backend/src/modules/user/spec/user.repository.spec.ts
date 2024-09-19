import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepository } from '../user.repository';
import { Repository } from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { User } from '../../../common/entities/user.entity';

const mockRepository: Partial<Repository<User>> = {
  save: jest.fn().mockResolvedValue(undefined),
};

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should call createQueryBuilder and execute with correct parameters', async () => {
      const userData: Partial<User> = {
        userId: 'some-uuid',
        role: Role.USER,
        type: 'type',
        identityNumber: '12345',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.png',
      };

      await repository.create(userData);

      expect(mockRepository.save).toHaveBeenCalledWith(userData);
    });
  });
});
