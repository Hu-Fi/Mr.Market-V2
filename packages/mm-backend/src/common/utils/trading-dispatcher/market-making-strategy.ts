import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { TradingStrategy } from './trading-strategy.interface';
import { SafeSnapshot } from '@mixin.dev/mixin-node-sdk';
import { decodeMarketMakingMemo } from '../memo-decoders';

@Injectable()
export class MarketMakingStrategy implements TradingStrategy {
  constructor(private readonly events: EventEmitter2) {}

  execute(decodedMemo: string, snapshot: SafeSnapshot): void {
    const details = decodeMarketMakingMemo(decodedMemo);
    if (!details) {
      return;
    }
    this.events.emit('market_making.create', details, snapshot);
  }
}
