import { decodeArbitrageMemo } from '../memo-decoders';
import { Injectable } from '@nestjs/common';
import { TradingStrategy } from './trading-strategy.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SafeSnapshot } from '@mixin.dev/mixin-node-sdk';

@Injectable()
export class ArbitrageStrategy implements TradingStrategy {
  constructor(private readonly events: EventEmitter2) {}

  execute(decodedMemo: string, snapshot: SafeSnapshot): void {
    const details = decodeArbitrageMemo(decodedMemo);
    if (!details) {
      return;
    }
    this.events.emit('arbitrage.create', details, snapshot);
  }
}
