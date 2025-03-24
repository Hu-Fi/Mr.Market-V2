import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../common/entities/user.entity';
import { AspectConfig } from '../../common/config/aspect.config';
import { AspectModule } from '../../common/utils/aspect/aspect.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AspectModule],
  providers: [UserService, UserRepository, AspectConfig],
  exports: [UserService, UserRepository],
})
export class UserModule {}
