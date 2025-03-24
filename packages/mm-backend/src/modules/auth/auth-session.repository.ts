import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MixinAuthSession } from '../../common/entities/mixin-auth-session.entity';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

@Injectable()
export class AuthSessionRepository {
  constructor(
    @InjectRepository(MixinAuthSession)
    private readonly mixinAuthRepository: Repository<MixinAuthSession>,
  ) {}

  async create(mixinAuth: MixinAuthSession): Promise<MixinAuthSession> {
    return this.mixinAuthRepository.save(mixinAuth);
  }

  async findAuthSessionByClientId(
    clientId: string,
  ): Promise<MixinAuthSession | undefined> {
    return this.mixinAuthRepository.findOne({ where: { clientId: clientId } });
  }

  async update(
    id: number,
    updateData: Partial<MixinAuthSession>,
  ): Promise<UpdateResult> {
    return await this.mixinAuthRepository.update(id, updateData);
  }
}
