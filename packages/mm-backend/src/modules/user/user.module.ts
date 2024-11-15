import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../common/entities/user.entity';
import { AspectConfig } from '../../common/config/aspect.config';
import { AspectModule } from '../../common/utils/aspect/aspect.module';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AspectModule,
    IntegrationsModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, UserRepository, AspectConfig],
  controllers: [UserController],
  exports: [UserService, UserRepository],
})
export class UserModule {}
