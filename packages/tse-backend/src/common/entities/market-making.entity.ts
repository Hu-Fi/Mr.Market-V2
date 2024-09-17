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

@Entity()
export class MarketMaking {
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

  @Column('decimal', { precision: 5, scale: 2 })
  bidSpread: number;

  @Column('decimal', { precision: 5, scale: 2 })
  askSpread: number;

  @Column('decimal', { precision: 10, scale: 2 })
  orderAmount: number;

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
}
