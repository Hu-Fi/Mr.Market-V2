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

  @OneToOne(() => User, (user) => user.mixinAuthSession, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

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
