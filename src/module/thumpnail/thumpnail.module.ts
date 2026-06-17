import { Module } from '@nestjs/common';
import { ThumpnailService } from './thumpnail.service';
import { ThumpnailController } from './thumpnail.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ThumbnaiRepo } from './thumbnail.repository';
import { CloudnaryModule } from '../cloudnary/cloudnary.module';

@Module({
  imports:[PrismaModule, CloudnaryModule],
  controllers: [ThumpnailController],
  providers: [ThumpnailService, ThumbnaiRepo],
  exports:[ThumbnaiRepo]
})
export class ThumpnailModule {}
