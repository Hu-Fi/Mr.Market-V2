import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignContribution } from '../../common/entities/campaign-contribution.entity';

@Injectable()
export class CampaignRepository {
  constructor(
    @InjectRepository(CampaignContribution)
    private readonly repository: Repository<CampaignContribution>,
  ) {}

  async save(data: any) {
    return await this.repository.save(data);
  }

  async findOneBy(options?: any) {
    return await this.repository.findOne({
      where: options,
    });
  }

  async find() {
    return await this.repository.find();
  }
}
