import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../../common/entities/user.entity';
import { Role } from '../../../common/enums/role.enum';
import { ClientSession } from '../../../common/interfaces/auth.interfaces';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  let authService: AuthService;
  let mixinGateway: MixinGateway;

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
          provide: MixinGateway,
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
    authService = testingModule.get<AuthService>(AuthService);
    mixinGateway = testingModule.get<MixinGateway>(MixinGateway);
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

  describe('getMixinUserBalance', () => {
    it('should fetch user balance details', async () => {
      const userId = 'some-user-id';
      const clientSession: ClientSession = {
        authorizationId: 'auth-id',
        privateKey: 'private-key',
        publicKey: 'public-key',
      };
      const balanceDetails = {
        balances: [],
        totalUSDBalance: '0',
        totalBTCBalance: '0',
      };

      jest
        .spyOn(authService, 'getMixinUserAuthSession')
        .mockResolvedValue(clientSession);
      jest
        .spyOn(mixinGateway, 'fetchUserBalanceDetails')
        .mockResolvedValue(balanceDetails);

      const result = await service.getMixinUserBalance(userId);

      expect(authService.getMixinUserAuthSession).toHaveBeenCalledWith(userId);
      expect(mixinGateway.fetchUserBalanceDetails).toHaveBeenCalledWith(
        clientSession,
      );
      expect(result).toEqual(balanceDetails);
    });
  });
});
