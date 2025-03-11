import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, Unique,
} from 'typeorm';

@Unique(['userId', 'clientId', 'exchangeName'])
@Entity()
export class ExchangeApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  exchangeName: string;

  @Column({ default: false })
  isDefaultAccount: boolean;

  @Column()
  apiKey: string;

  @Column()
  apiSecret: string;

  @Column({ nullable: true })
  apiPassphrase: string;

  @Column({ default: false })
  removed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
