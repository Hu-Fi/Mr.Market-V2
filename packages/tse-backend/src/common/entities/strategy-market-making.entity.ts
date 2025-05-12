import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  AmountChangeType,
  PriceSourceType,
  StrategyInstanceStatus,
} from '../enums/strategy-type.enums';
import { DecimalTransformer } from '../utils/transformer/decimal.utils';
import { Decimal } from 'decimal.js';

@Entity()
export class StrategyMarketMaking {
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

  @Column()
  exchangeName: string;

  @Column({ nullable: true })
  oracleExchangeName?: string;

  @Column('decimal', { precision: 16, scale: 8 })
  startPrice: number;

  @Column('decimal', { precision: 6, scale: 3 })
  bidSpread: number;

  @Column('decimal', { precision: 6, scale: 3 })
  askSpread: number;

  @Column('decimal', {
    precision: 32,
    scale: 16,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  orderAmount: Decimal;

  @Column()
  checkIntervalSeconds: number;

  @Column()
  numberOfLayers: number;

  @Column()
  priceSourceType: PriceSourceType;

  @Column('decimal', { precision: 10, scale: 2 })
  amountChangePerLayer: number;

  @Column()
  amountChangeType: AmountChangeType;

  @Column({ nullable: true })
  ceilingPrice?: number;

  @Column({ nullable: true })
  floorPrice?: number;

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
