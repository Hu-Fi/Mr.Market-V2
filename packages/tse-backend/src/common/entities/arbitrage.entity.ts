import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StrategyInstanceStatus } from '../enums/strategy-type.enums';
import { Decimal } from 'decimal.js';
import { DecimalTransformer } from '../utils/transformer/decimal.utils';

@Entity()
export class Arbitrage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  clientId: string;

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

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  minProfitability: number;

  @Column()
  exchangeAName: string;

  @Column()
  exchangeBName: string;

  @Column()
  checkIntervalSeconds: number;

  @Column({ nullable: true })
  maxOpenOrders?: number;

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
}
