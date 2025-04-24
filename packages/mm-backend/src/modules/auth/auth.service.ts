import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MixinIntegrationService } from '../../integrations/mixin.integration.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginCommand, MixinOAuthCommand } from './model/auth.model';
import {
  ClientDetails,
  ClientSession,
  JwtResponse,
  OAuthResponse,
} from '../../common/interfaces/auth.interfaces';
import { UserService } from '../user/user.service';
import { Role } from '../../common/enums/role.enum';
import { CustomLogger } from '../logger/logger.service';
import { AuthSessionRepository } from './auth-session.repository';
import { MixinAuthSession } from '../../common/entities/mixin-auth-session.entity';
import { v4 as uuidv4 } from 'uuid';
import { CryptoUtil } from '../../common/utils/auth/crypto.utils';

@Injectable()
export class AuthService {
  private readonly logger = new CustomLogger(AuthService.name);
  private readonly adminPassword: string;
  constructor(
    private readonly mixinGateway: MixinIntegrationService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authSessionRepository: AuthSessionRepository,
  ) {
    this.adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
  }

  async validateUser(command: AdminLoginCommand): Promise<JwtResponse> {
    const { password } = command;
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const hashedAdminPassword = CryptoUtil.sha3Hash(this.adminPassword);

    if (!CryptoUtil.safeCompare(hashedAdminPassword, password)) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = {
      sub: 'admin',
      clientId: 'admin',
      roles: ['Admin'],
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async mixinOauthHandler(command: MixinOAuthCommand): Promise<JwtResponse> {
    const { code } = command;
    if (code.length !== 64) {
      throw new BadRequestException('Invalid code length');
    }

    const { clientDetails, clientSession }: OAuthResponse =
      await this.mixinGateway.oauthHandler(code);

    const foundSession = await this.findAndUpdateAuthId(
      clientDetails.clientId,
      clientSession,
    );

    let userId = foundSession?.userId.userId;
    if (!foundSession) {
      userId = await this.saveUserToDatabase(clientDetails);
      await this.createMixinAuthSession(
        userId,
        clientDetails.clientId,
        clientSession,
      );
    }

    const payload = {
      sub: userId,
      clientId: clientDetails.clientId,
      roles: ['User'],
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async saveUserToDatabase(clientDetails: ClientDetails): Promise<string> {
    try {
      const userId = uuidv4();
      await this.userService.createUser({
        userId,
        role: Role.USER,
        type: clientDetails.type,
      });
      return userId;
    } catch (e) {
      this.logger.error(`Error saving user to database: ${e.message}`);
      throw e;
    }
  }

  async findAndUpdateAuthId(
    clientId: string,
    clientSession: ClientSession,
  ): Promise<MixinAuthSession | null> {
    const mixinAuthSession =
      await this.authSessionRepository.findAuthSessionByClientId(clientId);
    if (mixinAuthSession) {
      await this.authSessionRepository.update(mixinAuthSession.id, {
        ...clientSession,
      });
      return mixinAuthSession;
    }

    return null;
  }

  async createMixinAuthSession(
    userId: string,
    clientId: string,
    clientSession: ClientSession,
  ) {
    await this.authSessionRepository.create({
      userId: { userId: userId },
      clientId,
      ...clientSession,
    } as MixinAuthSession);
  }

  async getMixinUserAuthSession(userId: string) {
    const mixinAuthSession =
      await this.authSessionRepository.findAuthSessionByClientId(userId);
    if (!mixinAuthSession) {
      throw new NotFoundException('User not found');
    }

    const { authorizationId, privateKey, publicKey } = mixinAuthSession;
    return { authorizationId, privateKey, publicKey } as ClientSession;
  }

  async getOauthLink() {
    const clientId = this.configService.get<string>('MIXIN_APP_ID');
    const scope = this.configService.get<string>(
      'MIXIN_OAUTH_SCOPE',
      'PROFILE:READ+ASSETS:READ+SNAPSHOTS:READ',
    );
    return `https://mixin.one/oauth/authorize?client_id=${clientId}&scope=${scope}&response_type=code&return_to=`;
  }
}
