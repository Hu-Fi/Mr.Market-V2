import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn, Unique,
  UpdateDateColumn,
} from 'typeorm';

@Unique(['campaignAddress'])
@Entity()
export class Contribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  exchangeName: string;

  @Column()
  campaignAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
