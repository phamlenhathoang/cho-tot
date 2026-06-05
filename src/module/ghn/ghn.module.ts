import { Module } from '@nestjs/common';
import { GhnService } from './ghn.service';
import { GhnController } from './ghn.controller';
import { GHNConfig } from '../auth/config/ghn.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  controllers: [GhnController],
  providers: [GhnService, GHNConfig],
  exports:[GhnService]
})
export class GhnModule {}
