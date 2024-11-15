import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MixinAuthSession } from '../../common/entities/mixin-auth-session.entity';

@Injectable()
export class AuthSessionRepository {
  constructor(
    @InjectRepository(MixinAuthSession)
    private readonly mixinAuthRepository: Repository<MixinAuthSession>,
  ) {}

  async create(mixinAuth: MixinAuthSession): Promise<MixinAuthSession> {
    return this.mixinAuthRepository.save(mixinAuth);
  }

  async findByUserId(userId: string): Promise<MixinAuthSession | undefined> {
    return this.mixinAuthRepository.findOne({ where: { userId: userId } });
  }

  async update(
    id: number,
    updateData: Partial<MixinAuthSession>,
  ): Promise<void> {
    await this.mixinAuthRepository.update(id, updateData);
  }
}
