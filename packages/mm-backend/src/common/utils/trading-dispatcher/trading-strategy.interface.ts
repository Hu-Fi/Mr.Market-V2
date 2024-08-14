import { SafeSnapshot } from '@mixin.dev/mixin-node-sdk';

export interface TradingStrategy {
  execute(decodedMemo: string, snapshot: SafeSnapshot): void;
}
