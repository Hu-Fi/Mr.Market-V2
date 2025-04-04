import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class MixinAuthSession {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  userId: User;

  @Column()
  clientId: string;

  @Column()
  authorizationId: string;

  @Column()
  publicKey: string;

  @Column()
  privateKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
