import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginCommand, MixinOAuthCommand } from './model/auth.model';
import { JwtResponse } from '../../common/interfaces/auth.interfaces';
import { Role } from '../../common/enums/role.enum';
import { CryptoUtil } from '../../common/utils/auth/crypto.utils';
import { MixinAuthService } from '../mixin/auth/auth.service';

@Injectable()
export class AuthService {
  private readonly adminPassword: string;
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private mixinAuthService: MixinAuthService,
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

  async getOauthLink() {
    return await this.mixinAuthService.getOauthLink();
  }

  async mixinOauthHandler(command: MixinOAuthCommand) {
    return await this.mixinAuthService.mixinOauthHandler(command);
  }
}
