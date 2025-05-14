import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TradeOrder } from './trade-order.entity';

@Entity()
export class TradeOperation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column('jsonb', { nullable: true })
  details: Record<string, any>;

  @ManyToOne(() => TradeOrder, (order) => order.operations, {
    onDelete: 'CASCADE',
  })
  order: TradeOrder;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
