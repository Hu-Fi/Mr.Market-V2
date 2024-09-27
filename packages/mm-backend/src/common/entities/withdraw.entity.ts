import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '../enums/transaction.enum';

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

  @Column({ default: Status.PENDING })
  status: Status;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
