import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('admin/login')
  async login(@Body('password') password: string) {
    return await this.authService.validateUser(password);
  }

  @Get('mixin/oauth')
  async oauth(@Query('code') code: string) {
    return this.authService.mixinOauthHandler(code);
  }
}
