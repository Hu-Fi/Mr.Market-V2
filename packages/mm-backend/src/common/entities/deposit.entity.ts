import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DepositStatus } from '../enums/transaction.enum';

@Entity()
export class Deposit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  assetId: string;

  @Column()
  chainId: string;

  @Column('decimal', { precision: 15, scale: 8, default: 0 })
  amount: number;

  @Column()
  destination: string;

  @Column({ default: DepositStatus.PENDING })
  status: DepositStatus;

  @Column({ nullable: true })
  transactionHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
