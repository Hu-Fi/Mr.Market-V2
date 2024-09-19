import { Injectable, OnModuleInit } from '@nestjs/common';
import { addAspectToPointcut, Advice } from 'ts-aspect';
import { DatabaseCacheUtil } from '../utils/aspect/database/database.cache.util';
import { UserRepository } from '../../modules/user/user.repository';

@Injectable()
export class AspectConfig implements OnModuleInit {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly databaseCacheUtil: DatabaseCacheUtil,
  ) {}
  onModuleInit() {
    addAspectToPointcut(
      this.userRepository,
      '.*',
      Advice.After,
      this.databaseCacheUtil,
    );
  }
}
