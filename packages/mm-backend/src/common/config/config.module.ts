import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from './typeorm-config.service';

@Module({
    imports: [NestConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' })],
    providers: [TypeOrmConfigService],
    exports: [TypeOrmConfigService],
})
export class ConfigModule {}
