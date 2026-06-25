import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGatewayOrther } from '../auth/config/chat-gateway.config';
import { ChatRepo } from './chat.repository';
import { JwtModule } from '@nestjs/jwt';
import { WsJwtGuard } from '../auth/guards/ws-jwt/ws-jwt.guard';
import { PostModule } from '../post/post.module';
import { UserModule } from '../user/user.module';
import { ConversationModule } from '../conversation/conversation.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
    }),
    PostModule,
    UserModule,
    forwardRef(() => ConversationModule)
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGatewayOrther, ChatRepo, WsJwtGuard, ChatGateway],
  exports:[ChatService]
})
export class ChatModule {}
