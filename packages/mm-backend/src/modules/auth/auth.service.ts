import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { createHash } from 'crypto';
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

@Injectable()
export class AuthService {
  private readonly logger = new CustomLogger(AuthService.name);
  private readonly adminPassword: string;
  constructor(
    private readonly mixinGateway: MixinGateway,
    private configService: ConfigService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly repository: AuthSessionRepository,
  ) {
    this.adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
  }

  async validateUser(command: AdminLoginCommand): Promise<JwtResponse> {
    const { password } = command;
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const hashedAdminPassword = createHash('sha3-256')
      .update(this.adminPassword)
      .digest('hex');

    if (hashedAdminPassword !== password) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: 'admin', roles: ['Admin'] };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async mixinOauthHandler(command: MixinOAuthCommand): Promise<JwtResponse> {
    const { code } = command;
    if (code.length !== 64) {
      throw new BadRequestException('Invalid code length');
    }

    const { clientDetails, clientSession }: OAuthResponse =
      await this.mixinGateway.oauthHandler(code);

    await this.saveUserToDatabase(clientDetails);
    await this.findAndUpdateAuthId(clientDetails.clientId, clientSession);

    const payload = { sub: clientDetails.clientId, roles: ['User'] };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async saveUserToDatabase(clientDetails: ClientDetails): Promise<void> {
    try {
      await this.userService.createUser({
        userId: clientDetails.clientId,
        role: Role.USER,
        type: clientDetails.type,
        identityNumber: clientDetails.identityNumber,
        fullName: clientDetails.fullName,
        avatarUrl: clientDetails.avatarUrl,
      });
    } catch (e) {
      this.logger.error(`Error saving user to database: ${e.message}`);
      throw e;
    }
  }

  async findAndUpdateAuthId(
    userId: string,
    clientSession: ClientSession,
  ): Promise<MixinAuthSession> {
    let mixinAuthSession = await this.repository.findByUserId(userId);

    if (mixinAuthSession) {
      mixinAuthSession.authorizationId = clientSession.authorizationId;
      mixinAuthSession.privateKey = clientSession.privateKey;
      mixinAuthSession.publicKey = clientSession.publicKey;
      await this.repository.update(mixinAuthSession.id, { ...clientSession });
    } else {
      mixinAuthSession = await this.repository.create({
        userId: { userId } as any,
        ...clientSession,
      } as MixinAuthSession);
      await this.repository.create(mixinAuthSession);
    }

    return mixinAuthSession;
  }

  async getMixinUserAuthSession(userId: string) {
    const mixinAuthSession = await this.repository.findByUserId(userId);
    if (!mixinAuthSession) {
      throw new NotFoundException('User not found');
    }

    const { authorizationId, privateKey, publicKey } = mixinAuthSession;
    return { authorizationId, privateKey, publicKey } as ClientSession;
  }
}
