import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from '../auth/config/chat-gateway.config';
import { ChatRepo } from './chat.repository';
import { JwtModule } from '@nestjs/jwt';
import { WsJwtGuard } from '../auth/guards/ws-jwt/ws-jwt.guard';
import { PostModule } from '../post/post.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
    }),
    PostModule,
    UserModule
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatRepo, WsJwtGuard],
})
export class ChatModule {}
