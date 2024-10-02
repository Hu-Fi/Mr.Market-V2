import { Module } from '@nestjs/common';
import { InsertStrategy } from './database/strategies/insert.strategy';
import { SelectStrategy } from './database/strategies/select.strategy';
import { UpdateStrategy } from './database/strategies/update.strategy';
import { DatabaseCacheUtil } from './database/database.cache.util';

@Module({
  providers: [
    DatabaseCacheUtil,
    InsertStrategy,
    SelectStrategy,
    UpdateStrategy,
  ],
  exports: [DatabaseCacheUtil, InsertStrategy, SelectStrategy, UpdateStrategy],
})
export class AspectModule {}
