import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepository } from '../user.repository';
import { Repository } from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { User } from '../../../common/entities/user.entity';

const mockRepository: Partial<Repository<User>> = {
  save: jest.fn().mockResolvedValue(undefined),
  createQueryBuilder: jest.fn(),
};

const mockQueryBuilder: any = {
  insert: jest.fn().mockReturnThis(),
  into: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  orIgnore: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue(undefined),
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

    (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(
      mockQueryBuilder,
    );
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

      expect(mockQueryBuilder.insert).toHaveBeenCalled();
      expect(mockQueryBuilder.into).toHaveBeenCalledWith(User);
      expect(mockQueryBuilder.values).toHaveBeenCalledWith(userData);
      expect(mockQueryBuilder.orIgnore).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });
});
