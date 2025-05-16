import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from 'typeorm';

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

  @Column({ nullable: true })
  apiPassphrase: string;

  @CreateDateColumn()
  createdAt: Date;
}
