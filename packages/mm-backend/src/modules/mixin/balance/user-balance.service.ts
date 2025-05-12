import { Injectable } from '@nestjs/common';
import { MixinIntegrationService } from '../../../integrations/mixin.integration.service';
import { MixinAuthService } from '../auth/auth.service';

@Injectable()
export class UserBalanceService {
  constructor(
    private readonly mixinGateway: MixinIntegrationService,
    private readonly mixinAuthService: MixinAuthService,
  ) {}

  async getMixinUserBalance(userId: string) {
    const clientSession =
      await this.mixinAuthService.getMixinUserAuthSession(userId);
    return await this.mixinGateway.fetchUserBalanceDetails(clientSession);
  }
}
