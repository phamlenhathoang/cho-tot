import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { TwilioConfig } from '../auth/config/twilio.config';
import { RedisModule } from '../redis/redis.module';
import { UserModule } from '../user/user.module';

@Module({
  imports:[RedisModule, UserModule],
  controllers: [TwilioController],
  providers: [TwilioService, TwilioConfig],
})
export class TwilioModule {}
