import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Decimal } from 'decimal.js';
import { DecimalTransformer } from '../utils/transformer/decimal.utils';

@Entity()
export class UserBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  assetId: string;

  @Column('decimal', {
    precision: 32,
    scale: 16,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  balance: Decimal;
}
