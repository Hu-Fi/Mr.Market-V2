import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Snapshot {
  @PrimaryColumn()
  snapshot_id: string;

  @Column()
  type: string;

  @Column()
  asset_id: string;

  @Column()
  amount: string;

  @Column()
  user_id: string;

  @Column()
  opponent_id: string;

  @Column()
  memo: string;

  @Column({ nullable: true })
  transaction_hash: string;

  @Column()
  created_at: string;

  @Column({ nullable: true })
  confirmations: number;

  @Column({ nullable: true })
  opening_balance: string;

  @Column({ nullable: true })
  closing_balance: string;
}
