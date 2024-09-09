import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginCommand, MixinOAuthCommand } from './model/auth.model';
import { JwtResponse } from '../../common/interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  private readonly adminPassword: string;
  constructor(
    private readonly mixinGateway: MixinGateway,
    private configService: ConfigService,
    private jwtService: JwtService,
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

    const clientData: any = await this.mixinGateway.oauthHandler(code);

    //TODO: Save the user to the database, if not already there.

    const payload = { sub: clientData.clientId, roles: ['User'] };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
