import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';
import { CustomLogger } from '../../logger/logger.service';
import { MixinIntegrationService } from '../../../integrations/mixin.integration.service';
import { UserService } from '../../user/user.service';
import { EncryptionService } from '../../../common/utils/auth/encryption.service';
import {
  ClientDetails,
  ClientSession,
  OAuthResponse,
} from '../../../common/interfaces/auth.interfaces';
import { Role } from '../../../common/enums/role.enum';
import { handleAndThrowMixinApiError } from '../../../common/exceptions/mixin-api.exceptions';
import { MixinAuthSession } from '../../../common/entities/mixin-auth-session.entity';
import { MixinOAuthCommand } from '../../auth/model/auth.model';
import { AuthSessionRepository } from './auth-session.repository';

@Injectable()
export class MixinAuthService {
  private readonly logger = new CustomLogger(MixinAuthService.name);
  constructor(
    private readonly mixinGateway: MixinIntegrationService,
    private configService: ConfigService,
    private readonly userService: UserService,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async mixinOauthHandler(command: MixinOAuthCommand) {
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

    return {
      userId: userId,
      clientId: clientDetails.clientId,
      roles: [Role.USER],
    };
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
      const userId = v4();
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
    const encryptedAuthorizationId = await this.encryptionService.encrypt(
      clientSession.authorizationId,
    );
    const encryptedPrivateKey = await this.encryptionService.encrypt(
      clientSession.privateKey,
    );
    const encryptedPublicKey = await this.encryptionService.encrypt(
      clientSession.publicKey,
    );

    await this.authSessionRepository.create({
      userId: { userId: userId },
      clientId,
      authorizationId: encryptedAuthorizationId,
      privateKey: encryptedPrivateKey,
      publicKey: encryptedPublicKey,
    } as MixinAuthSession);
  }

  async getMixinUserAuthSession(userId: string) {
    const mixinAuthSession =
      await this.authSessionRepository.findAuthSessionByClientId(userId);
    if (!mixinAuthSession) {
      throw new NotFoundException('User auth session not found');
    }

    const authorizationId = await this.encryptionService.decrypt(
      mixinAuthSession.authorizationId,
    );
    const privateKey = await this.encryptionService.decrypt(
      mixinAuthSession.privateKey,
    );
    const publicKey = await this.encryptionService.decrypt(
      mixinAuthSession.publicKey,
    );

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
