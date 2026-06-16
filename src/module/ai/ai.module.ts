import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { RedisModule } from '../redis/redis.module';
import { SwaggerParserService } from '../swagger/swagger-parser-service';

@Module({
  imports:[RedisModule],
  controllers: [AiController],
  providers: [AiService, SwaggerParserService],
})
export class AiModule {}
