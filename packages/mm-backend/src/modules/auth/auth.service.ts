import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly adminPassword: string;
  constructor(
    private readonly mixinGateway: MixinGateway,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.adminPassword = configService.get<string>('ADMIN_PASSWORD');
  }

  async validateUser(password: string): Promise<string> {
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
    return this.jwtService.sign(payload);
  }

  async mixinOauthHandler(code: string) {
    if (code.length !== 64) {
      throw new HttpException('Invalid code length', HttpStatus.BAD_REQUEST);
    }
    return this.mixinGateway.oauthHandler(code);
  }
}
