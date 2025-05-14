import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StrategyInstanceStatus } from '../enums/strategy-type.enums';
import { DecimalTransformer } from '../utils/transformer/decimal.utils';
import { Decimal } from 'decimal.js';

@Entity()
export class StrategyVolume {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  clientId: string;

  @Column()
  exchangeName: string;

  @Column()
  sideA: string;

  @Column()
  sideB: string;

  @Column('decimal', {
    precision: 32,
    scale: 16,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  amountToTrade: Decimal;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  incrementPercentage: number;

  @Column({ type: 'int' })
  tradeIntervalSeconds: number;

  @Column({ type: 'int' })
  numTotalTrades: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  pricePushRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  status: StrategyInstanceStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastTradingAttemptAt: Date;

  @Column({ nullable: true })
  pausedReason: string;

  @Column({ type: 'int', default: 0 })
  tradesExecuted: number;

  @Column({ type: 'decimal', precision: 12, scale: 6, nullable: true })
  currentMakerPrice: number;
}
