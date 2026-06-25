import { forwardRef, Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationRepository } from './conversation.repository';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports:[forwardRef(() => ChatModule)],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationRepository],
  exports:[ConversationRepository]
})
export class ConversationModule {}
