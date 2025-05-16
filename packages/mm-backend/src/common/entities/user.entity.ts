import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique, OneToOne, OneToMany,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { MixinAuthSession } from './mixin-auth-session.entity';
import { MixinDeposit } from './mixin-deposit.entity';
import { MixinWithdrawal } from './mixin-withdrawal.entity';

@Entity()
@Unique(['userId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  role: Role;

  @Column({
    nullable: true,
  })
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => MixinAuthSession, (session) => session.user, { cascade: true })
  mixinAuthSession: MixinAuthSession;

  @OneToMany(() => MixinDeposit, (deposit) => deposit.user)
  deposits: MixinDeposit[];

  @OneToMany(() => MixinWithdrawal, (withdrawal) => withdrawal.user)
  withdrawals: MixinWithdrawal[];
}
