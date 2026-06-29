import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionRepository } from './transaction.repository';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionService]
})
export class TransactionModule {}
