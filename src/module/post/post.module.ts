import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { CategotyModule } from '../categoty/category.module';
import { ThumpnailModule } from '../thumpnail/thumpnail.module';
import { PostRepository } from './post.repositosy';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports:[PrismaModule,
    forwardRef(() => CategotyModule),
    forwardRef(() => ThumpnailModule),
    forwardRef(() => UserModule),
    RedisModule
  ],
  controllers: [PostController],
  providers: [PostService, PostRepository],
  exports:[PostRepository, PostService]
})
export class PostModule {}
