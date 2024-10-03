import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../common/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(data: Partial<User>) {
    const queryBuilder = this.repository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(data)
      .orIgnore();
    // Executes 'ON CONFLICT DO NOTHING' when a record with the unique 'userId' already exists in the database

    await queryBuilder.execute();
  }
}
