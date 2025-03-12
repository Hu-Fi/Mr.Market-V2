import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeApiKeyReadOnly } from '../../../common/entities/exchange-api-key-read-only.entity';
import { ExchangeApiKeyReadonlyData } from './model/exchange-api-key-readonly.model';

@Injectable()
export class ExchangeApiKeyReadonlyRepository {
  constructor(
    @InjectRepository(ExchangeApiKeyReadOnly)
    private readonly repository: Repository<ExchangeApiKeyReadOnly>,
  ) {}

  save(data: ExchangeApiKeyReadonlyData) {
    return this.repository.save(data);
  }

  async findByName(
    exchangeName: string,
  ): Promise<ExchangeApiKeyReadOnly[] | undefined> {
    return await this.repository.find({
      where: {
        exchangeName,
      },
    });
  }
}
