import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AdminLoginCommand,
  AdminLoginDto,
  AdminLoginResponse,
  MixinOAuthCommand,
  MixinOAuthDto,
} from './model/auth.model';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  @Post('admin/login')
  @ApiOperation({ summary: 'Pass hashed admin password' })
  async login(@Body() dto: AdminLoginDto): Promise<AdminLoginResponse> {
    const command = this.mapper.map(dto, AdminLoginDto, AdminLoginCommand);
    return await this.authService.validateUser(command);
  }

  @Post('mixin/oauth')
  @ApiOperation({ summary: 'Pass OAuth code' })
  async oauth(@Body() dto: MixinOAuthDto) {
    const command = this.mapper.map(dto, MixinOAuthDto, MixinOAuthCommand);
    return this.authService.mixinOauthHandler(command);
  }
}