import { forwardRef, Module } from '@nestjs/common';
import { ThumpnailService } from './thumpnail.service';
import { ThumpnailController } from './thumpnail.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ThumbnaiRepo } from './thumbnail.repository';
import { CloudnaryModule } from '../cloudnary/cloudnary.module';
import { PostModule } from '../post/post.module';

@Module({
  imports:[PrismaModule, CloudnaryModule,
    forwardRef(() => PostModule)
  ],
  controllers: [ThumpnailController],
  providers: [ThumpnailService, ThumbnaiRepo],
  exports:[ThumbnaiRepo]
})
export class ThumpnailModule {}
