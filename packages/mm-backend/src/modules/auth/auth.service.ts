import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginCommand, AdminLoginResponse, MixinOAuthCommand, MixinOAuthResponse } from './model/auth.model';

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

  async validateUser(command: AdminLoginCommand): Promise<AdminLoginResponse> {
    const { password } = command;
    if (!this.adminPassword || !password) {
      throw new UnauthorizedException('Password is required');
    }

    const hashedAdminPassword = createHash('sha3-256')
      .update(this.adminPassword)
      .digest('hex');

    if (hashedAdminPassword !== password) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { username: 'admin', roles: ['Admin'], sub: 'admin_id' };
    return { accessToken:  this.jwtService.sign(payload) };
  }

  async mixinOauthHandler(command: MixinOAuthCommand): Promise<MixinOAuthResponse> {
    const { code } = command;
    if (code.length !== 64) {
      throw new HttpException('Invalid code length', HttpStatus.BAD_REQUEST);
    }
    return this.mixinGateway.oauthHandler(code);
  }
}
