import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '../../common/entities/user.entity';
import { MixinIntegrationService } from '../../integrations/mixin.integration.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private readonly mixinGateway: MixinIntegrationService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async createUser(user: Partial<User>) {
    await this.repository.create(user);
  }

  async getMixinUserBalance(userId: string) {
    const clientSession =
      await this.authService.getMixinUserAuthSession(userId);
    return await this.mixinGateway.fetchUserBalanceDetails(clientSession);
  }
}
