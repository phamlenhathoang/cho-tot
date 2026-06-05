import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { TwilioConfig } from '../auth/config/twilio.config';

@Module({
  controllers: [TwilioController],
  providers: [TwilioService, TwilioConfig],
})
export class TwilioModule {}
