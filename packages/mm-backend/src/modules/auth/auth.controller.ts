import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AdminLoginCommand,
  AdminLoginDto,
  LogoutCommand,
  LogoutDto,
  MixinOAuthCommand,
  MixinOAuthDto,
  RefreshTokenCommand,
  RefreshTokenDto,
} from './model/auth.model';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { JwtResponse } from '../../common/interfaces/auth.interfaces';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('admin/login')
  @ApiOperation({ summary: 'Pass hashed admin password' })
  async login(@Body() dto: AdminLoginDto): Promise<JwtResponse> {
    const command = this.mapper.map(dto, AdminLoginDto, AdminLoginCommand);
    return await this.authService.validateUser(command);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    const command = this.mapper.map(dto, RefreshTokenDto, RefreshTokenCommand);
    return this.authService.refreshAccessToken(command);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    const command = this.mapper.map(dto, LogoutDto, LogoutCommand);
    await this.authService.revokeRefreshToken(command);
    return { message: 'Logged out successfully' };
  }

  @Get('mixin/oauth/get-link')
  async getOauthLink(): Promise<string> {
    return await this.authService.getOauthLink();
  }

  @Post('mixin/oauth')
  @ApiOperation({ summary: 'Pass OAuth code' })
  async oauth(@Body() dto: MixinOAuthDto): Promise<JwtResponse> {
    const command = this.mapper.map(dto, MixinOAuthDto, MixinOAuthCommand);
    return this.authService.mixinOauthHandler(command);
  }
}
