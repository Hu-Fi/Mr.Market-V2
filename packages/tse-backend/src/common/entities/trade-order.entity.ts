import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TradeOperation } from './trade-operation.entity';
import { DecimalTransformer } from '../utils/transformer/decimal.utils';
import { Decimal } from 'decimal.js';

@Entity()
export class TradeOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exchangeName: string;

  @Column()
  userId: string;

  @Column()
  clientId: string;

  @Column()
  symbol: string;

  @Column()
  side: string;

  @Column()
  type: string;

  @Column('decimal', {
    precision: 32,
    scale: 16,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  amount: Decimal;

  @Column('decimal', { precision: 18, scale: 10, nullable: true })
  price: number | null;

  @Column()
  status: string;

  @Column({ nullable: true })
  orderExtId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TradeOperation, (operation) => operation.order, {
    cascade: true,
  })
  operations: TradeOperation[];
}
