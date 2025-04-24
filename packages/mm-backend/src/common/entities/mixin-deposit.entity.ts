import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DecimalTransformer } from '../utils/transformer/decimal.utils';
import { Decimal } from 'decimal.js';

@Entity()
export class MixinDeposit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  assetId: string;

  @Column()
  chainId: string;

  @Column('decimal', {
    precision: 32,
    scale: 16,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  amount: Decimal;

  @Column()
  destination: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  transactionHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
