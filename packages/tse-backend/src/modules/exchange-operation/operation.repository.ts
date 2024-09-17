import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Operation } from '../../common/entities/operation.entity';
import { CreateOperationDto } from '../../common/interfaces/exchange-operation.interfaces';

@Injectable()
export class OperationRepository {
  constructor(
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
  ) {}

  async create(data: CreateOperationDto) {
    return await this.operationRepository.save(data);
  }
}
