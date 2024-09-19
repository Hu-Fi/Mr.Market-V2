import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginCommand, MixinOAuthCommand } from './model/auth.model';
import { JwtResponse, OAuthResponse } from '../../common/interfaces/auth.interfaces';
import { UserService } from '../user/user.service';
import { Role } from '../../common/enums/role.enum';
import { CustomLogger } from '../logger/logger.service';

@Injectable()
export class AuthService {
  private readonly logger = new CustomLogger(AuthService.name);
  private readonly adminPassword: string;
  constructor(
    private readonly mixinGateway: MixinGateway,
    private configService: ConfigService,
    private jwtService: JwtService,
    private readonly userService: UserService,
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

    const clientData: OAuthResponse = await this.mixinGateway.oauthHandler(code);

    await this.saveUserToDatabase(clientData);

    const payload = { sub: clientData.clientId, roles: ['User'] };
    return { accessToken: this.jwtService.sign(payload) };
  }

  private async saveUserToDatabase(clientData: OAuthResponse): Promise<void> {
    try {
      await this.userService.createUser({
        userId: clientData.clientId,
        role: Role.USER,
        type: clientData.type,
        identityNumber: clientData.identityNumber,
        fullName: clientData.fullName,
        avatarUrl: clientData.avatarUrl,
      });
    } catch (e) {
      this.logger.error(`Error saving user to database: ${e.message}`);
      throw e;
    }
  }
}
