import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { DecimalTransformer } from '../utils/transformer/decimal.utils';
import { Decimal } from 'decimal.js';

@Entity()
export class ExchangeDeposit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  txId: string;

  @Column()
  txTimestamp: string;

  @Column()
  exchangeName: string;

  @Column()
  network: string;

  @Column()
  symbol: string;

  @Column('decimal', {
    precision: 32,
    scale: 16,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  amount: Decimal;

  @CreateDateColumn()
  createdAt: Date;
}
