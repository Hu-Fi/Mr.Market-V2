import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WithdrawalStatus } from '../enums/transaction.enum';

@Entity()
export class Withdraw {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  assetId: string;

  @Column('decimal', { precision: 15, scale: 8, default: 0 })
  amount: number;

  @Column()
  destination: string;

  @Column()
  status: WithdrawalStatus;

  @Column({ nullable: true })
  transactionHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
