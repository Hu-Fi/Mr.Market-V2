import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../../common/entities/transaction.entity';
import { TransactionRepository } from './transaction.repository';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { TransactionProfile } from './transaction.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    IntegrationsModule,
  ],
  providers: [TransactionService, TransactionRepository, TransactionProfile],
  controllers: [TransactionController],
  exports: [TransactionService, TransactionRepository],
})
export class TransactionModule {}
