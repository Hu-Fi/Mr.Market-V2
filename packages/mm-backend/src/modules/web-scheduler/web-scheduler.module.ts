import { Module } from '@nestjs/common';
import { WebSchedulerService } from './web-scheduler.service';
import { WebSchedulerController } from './web-scheduler.controller';
import { TransactionModule } from '../mixin/transaction.module';
import Redlock from 'redlock';
import Redis from 'ioredis';
import { RedisClientProvider } from '../../common/config/redis.provider';

@Module({
  imports: [TransactionModule],
  providers: [
    WebSchedulerService,
    RedisClientProvider,
    {
      provide: 'REDLOCK',
      useFactory: (redisClient: Redis) => {
        return new Redlock([redisClient], {
          retryCount: 0,
        });
      },
      inject: ['REDIS_CLIENT'],
    },
  ],
  controllers: [WebSchedulerController],
})
export class WebSchedulerModule {}
