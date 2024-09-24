import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  assetId: string;

  @Column('decimal', { precision: 15, scale: 8, default: 0 })
  balance: number;
}
