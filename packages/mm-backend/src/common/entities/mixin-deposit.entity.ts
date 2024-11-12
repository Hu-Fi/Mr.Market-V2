import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column('decimal', { precision: 15, scale: 8, default: 0 })
  amount: number;

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
