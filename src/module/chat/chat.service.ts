import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatRepo } from './chat.repository';
import { CreateConversationDto } from '../conversation/dto/create-conversation';
import { GetMessagesDto } from './dto/get-messages.dto';
import { ConversationRepository } from '../conversation/conversation.repository';
import { SendMessageDto } from './dto/send-messge.dto';


@Injectable()
export class ChatService {
    constructor(
        private readonly chatRepo: ChatRepo,
        private readonly conversationRepository: ConversationRepository

    ) { }

    async save(chat: any) {
        return await this.chatRepo.save(chat)
    }

    async getMessages(id: number, dto: GetMessagesDto, userId: number) {
        const conversation = await this.conversationRepository.getConversationById(id, userId);

        if (!conversation) {
            throw new NotFoundException("Conversation does not exist");
        }

        if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
            throw new ForbiddenException("The system does not permision you view this conversation")
        }

        const { page, limit } = dto

        const skip = (page - 1) * limit

        const messages = await this.chatRepo.getMessages(id, skip, limit)

        return {
            data: messages,
            skip,
            limit
        }
    }

    async sendMessage(dto: SendMessageDto, senderId: number) {
        const conversation = await this.conversationRepository.getConversationById(dto.conversationId, senderId);

        if (!conversation) {
            throw new NotFoundException('Conversation does not exist');
        }

        if (conversation.buyerId !== senderId && conversation.sellerId !== senderId) {
            throw new ForbiddenException('You do not permission send a messege in this conversation')
        }

        const message = await this.chatRepo.createMessage(dto.conversationId, senderId, dto.content);

        const receiverId =
            conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;

        return { message, receiverId };
    }
}
