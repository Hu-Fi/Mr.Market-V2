import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Operation } from './operation.entity';

@Entity()
export class Order {
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

  @Column('decimal', { precision: 18, scale: 10 })
  amount: number;

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

  @OneToMany(() => Operation, (operation) => operation.order, { cascade: true })
  operations: Operation[];
}
