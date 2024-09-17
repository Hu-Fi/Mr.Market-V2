import { Aspect, AspectContext } from 'ts-aspect';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SelectStrategy } from './strategies/select.strategy';
import { CacheStrategy } from './strategy.interface';
import { InsertStrategy } from './strategies/insert.strategy';
import { UpdateStrategy } from './strategies/update.strategy';
import { CustomLogger } from '../../../../modules/logger/logger.service';

@Injectable()
export class DatabaseCacheUtil implements Aspect {
  private readonly logger = new CustomLogger(DatabaseCacheUtil.name);
  private strategies: { [key: string]: CacheStrategy };

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private selectStrategy: SelectStrategy,
    private insertStrategy: InsertStrategy,
    private updateStrategy: UpdateStrategy,
  ) {
    this.strategies = {
      find: this.selectStrategy,
      create: this.insertStrategy,
      save: this.updateStrategy,
      update: this.updateStrategy,
    };
  }

  async execute(ctx: AspectContext) {
    const strategy = Object.keys(this.strategies).find((prefix) =>
      ctx.methodName.startsWith(prefix),
    );

    if (strategy) {
      return this.strategies[strategy]
        .execute(this.cacheManager)
        .then(() =>
          this.logger.debug(
            `Cache strategy "${strategy}" executed successfully for method "${ctx.methodName}"`,
          ),
        )
        .catch((error) => {
          this.logger.error(
            `Error executing ${ctx.methodName}: ${error.message}`,
            error.stack,
          );
        });
    } else {
      this.logger.error(`No cache aspect strategy found for ${ctx.methodName}`);
    }
  }
}
