import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Unique(['userId', 'clientId', 'exchangeName'])
@Entity()
export class ExchangeApiKeyReadOnly {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  clientId: string;

  @Column()
  exchangeName: string;

  @Column()
  apiKey: string;

  @Column()
  apiSecret: string;

  @CreateDateColumn()
  createdAt: Date;
}
