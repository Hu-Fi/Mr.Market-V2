import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contribution } from '../../common/entities/contribution.entity';

@Injectable()
export class CampaignRepository {
  constructor(
    @InjectRepository(Contribution)
    private readonly repository: Repository<Contribution>,
  ) {}

  async save(data: any) {
    return await this.repository.save(data);
  }

  async find() {
    return await this.repository.find();
  }
}
