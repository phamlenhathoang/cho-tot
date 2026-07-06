import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { BankRepository } from './bank.repository';
import { HttpModule } from '@nestjs/axios/dist/http.module';

@Module({
  imports: [HttpModule],
  controllers: [BankController],
  providers: [BankService, BankRepository],
})
export class BankModule { }
