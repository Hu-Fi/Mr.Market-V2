import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AdminLoginCommand,
  LogoutCommand,
  MixinOAuthCommand,
  RefreshTokenCommand,
} from './model/auth.model';
import { JwtResponse } from '../../common/interfaces/auth.interfaces';
import { Role } from '../../common/enums/role.enum';
import { CryptoUtil } from '../../common/utils/auth/crypto.utils';
import { MixinAuthService } from '../mixin/auth/auth.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { v4 } from 'uuid';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  private readonly adminPassword: string;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

    return this.generateTokens(Role.ADMIN, Role.ADMIN, [Role.ADMIN]);
  }

  async generateTokens(
    userId: string,
    clientId: string,
    roles: Role[],
  ): Promise<JwtResponse> {
    const payload = {
      sub: userId,
      clientId,
      roles,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: userId, jti: v4() },
      { expiresIn: '7d' },
    );

    await this.storeRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const decoded = this.jwtService.decode(refreshToken);
    const key = this.getRefreshTokenKey(userId, decoded['jti']);
    await this.cacheManager.set(key, 'valid', 7 * 24 * 60 * 60 * 1000);
  }

  async refreshAccessToken(command: RefreshTokenCommand): Promise<JwtResponse> {
    const { refreshToken } = command;
    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken);
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid refresh token, error: ${error.message}`,
      );
    }

    const userId = decoded.sub;
    const jti = decoded.jti;

    const key = this.getRefreshTokenKey(userId, jti);
    const isValid = await this.cacheManager.get(key);

    if (!isValid) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    await this.cacheManager.del(key);

    return this.generateTokens(userId, userId, [Role.ADMIN]);
  }

  async revokeRefreshToken(command: LogoutCommand): Promise<void> {
    const { refreshToken } = command;
    const decoded = this.jwtService.decode(refreshToken);
    const userId = decoded.sub;
    const jti = decoded.jti;

    const key = this.getRefreshTokenKey(userId, jti);
    await this.cacheManager.del(key);
  }

  private getRefreshTokenKey(userId: string, jti: string): string {
    return `refresh:${userId}:${jti}`;
  }

  async getOauthLink() {
    return await this.mixinAuthService.getOauthLink();
  }

  async mixinOauthHandler(command: MixinOAuthCommand) {
    const userInfo = await this.mixinAuthService.mixinOauthHandler(command);
    return this.generateTokens(
      userInfo.userId,
      userInfo.clientId,
      userInfo.roles,
    );
  }
}
