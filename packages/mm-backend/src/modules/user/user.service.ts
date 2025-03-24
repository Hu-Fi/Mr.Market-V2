import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '../../common/entities/user.entity';

@Injectable()
export class UserService {
  constructor(private repository: UserRepository) {}

  async createUser(user: Partial<User>) {
    await this.repository.create(user);
  }

  async getUserById(id: string) {
    return this.repository.findByUserId(id);
  }
}
