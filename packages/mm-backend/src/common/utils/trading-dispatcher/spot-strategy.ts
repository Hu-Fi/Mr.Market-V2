import { decodeSpotMemo } from '../memo-decoders';
import { Injectable } from '@nestjs/common';
import { TradingStrategy } from './trading-strategy.interface';
import { SafeSnapshot } from '@mixin.dev/mixin-node-sdk';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SpotStrategy implements TradingStrategy {
  constructor(private readonly events: EventEmitter2) {}

  execute(decodedMemo: string, snapshot: SafeSnapshot): void {
    const details = decodeSpotMemo(decodedMemo);
    if (!details) {
      return;
    }
    const spotOrderCreateEvent = { ...details, snapshot };
    this.events.emit('spot.create', spotOrderCreateEvent);
  }
}
