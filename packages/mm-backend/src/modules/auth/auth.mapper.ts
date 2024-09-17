import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from '@automapper/core';
import {
  AdminLoginCommand,
  AdminLoginDto,
  MixinOAuthCommand,
  MixinOAuthDto,
} from './model/auth.model';

@Injectable()
export class AuthProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, AdminLoginDto, AdminLoginCommand);
      createMap(mapper, MixinOAuthDto, MixinOAuthCommand);
    };
  }
}
