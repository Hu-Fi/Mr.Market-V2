import { Module } from '@nestjs/common';
import { SnapshotsService } from './snapshots.service';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { StrategyExecutor } from '../../../common/utils/trading-dispatcher/strategy-executor';
import { SnapshotsRepository } from './snapshots.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Snapshot } from '../../../common/entities/snapshots.entity';
import { SpotStrategy } from '../../../common/utils/trading-dispatcher/spot-strategy';
import { ArbitrageStrategy } from '../../../common/utils/trading-dispatcher/arbitrage-strategy';
import { MarketMakingStrategy } from '../../../common/utils/trading-dispatcher/market-making-strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Snapshot])],
  providers: [
    SnapshotsService,
    MixinGateway,
    StrategyExecutor,
    SnapshotsRepository,
    SpotStrategy,
    ArbitrageStrategy,
    MarketMakingStrategy,
  ],
  exports: [SnapshotsService],
})
export class SnapshotsModule {}
