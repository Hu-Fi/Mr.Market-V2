import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TradeOperation } from '../../common/entities/trade-operation.entity';
import { CreateOperationDto } from '../../common/interfaces/exchange-operation.interfaces';

@Injectable()
export class OperationRepository {
  constructor(
    @InjectRepository(TradeOperation)
    private readonly operationRepository: Repository<TradeOperation>,
  ) {}

  async create(data: CreateOperationDto) {
    return await this.operationRepository.save(data);
  }
}
