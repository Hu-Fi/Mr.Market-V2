import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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
import { handleAndThrowMixinApiError } from '../../common/exceptions/mixin-api.exceptions';

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
      sub: Role.ADMIN,
      clientId: Role.ADMIN,
      roles: [Role.ADMIN],
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async mixinOauthHandler(command: MixinOAuthCommand): Promise<JwtResponse> {
    const { code } = command;
    this.validateAuthorizationCode(code);

    const oauthResponse = await this.fetchMixinOAuthDetails(code);
    this.validateOAuthResponse(oauthResponse, code);

    const { clientDetails, clientSession } = oauthResponse;

    const userId = await this.findOrCreateUserAndSession(
      clientDetails,
      clientSession,
    );

    if (!userId) {
      this.logger.error(
        `User ID could not be determined after find/create process for clientId: ${clientDetails.clientId}`,
      );
      throw new InternalServerErrorException(
        'Failed to resolve user identifier during authentication.',
      );
    }

    const payload = {
      sub: userId,
      clientId: clientDetails.clientId,
      roles: [Role.USER],
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  private validateAuthorizationCode(code: string): void {
    if (!code || code.length !== 64) {
      throw new BadRequestException('Invalid or missing authorization code.');
    }
  }

  private async fetchMixinOAuthDetails(code: string): Promise<OAuthResponse> {
    try {
      return await this.mixinGateway.oauthHandler(code);
    } catch (error) {
      this.logger.error(
        `Mixin OAuth API call failed for code: ${code}. Error: ${error.message}`,
        error.stack,
      );
      handleAndThrowMixinApiError(error);
    }
  }

  private validateOAuthResponse(
    response: OAuthResponse | null | undefined,
    code: string,
  ): void {
    if (
      !response?.clientDetails?.clientId ||
      !response?.clientSession?.authorizationId
    ) {
      this.logger.error(
        `Incomplete OAuth response received after successful API call for code: ${code}. Response: ${JSON.stringify(response)}`,
      );
      throw new InternalServerErrorException(
        'Failed to process Mixin OAuth response due to incomplete data.',
      );
    }
  }

  private async findOrCreateUserAndSession(
    clientDetails: ClientDetails,
    clientSession: ClientSession,
  ): Promise<string> {
    const { clientId } = clientDetails;
    const foundSession = await this.findAndUpdateAuthId(
      clientId,
      clientSession,
    );

    if (foundSession) {
      const userId = foundSession.userId?.userId;
      if (!userId) {
        this.logger.error(
          `Found session for clientId ${clientId} (Session ID: ${foundSession.id}) is missing userId information.`,
        );
        throw new InternalServerErrorException(
          'User data inconsistency detected for existing session.',
        );
      }
      this.logger.log(`Found existing user ${userId} for clientId ${clientId}`);
      return userId;
    } else {
      this.logger.log(
        `No existing session found for clientId ${clientId}. Creating new user and session.`,
      );
      const newUserId = await this.saveUserToDatabase(clientDetails);
      await this.createMixinAuthSession(newUserId, clientId, clientSession);
      this.logger.log(
        `Created new user ${newUserId} and session for clientId ${clientId}`,
      );
      return newUserId;
    }
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
      throw new NotFoundException('User auth session not found');
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
