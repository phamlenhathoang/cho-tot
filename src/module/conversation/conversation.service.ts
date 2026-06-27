
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { CreateConversationDto } from './dto/create-conversation';
import { ChatRepo } from '../chat/chat.repository';


@Injectable()
export class ConversationService {
    constructor(
        private readonly conservationRepository: ConversationRepository,
        private readonly chatRepository: ChatRepo
    ){}

    async createOrGetConversation(createConversationDto: CreateConversationDto, buyerId: number){

        if(createConversationDto.sellerId ===  buyerId){
            throw new ForbiddenException("Can not create conversation with myself");
        }
        const conservation = await this.conservationRepository.getConversation(buyerId, createConversationDto.sellerId);
        if(!conservation){
            return await this.conservationRepository.createConversation(buyerId, createConversationDto.sellerId);
        }

        return conservation;
    }

    async getConversationById(id: number, userId: number){ 
        const conversation = await this.conservationRepository.getConversationById(id, userId)
        if(!conversation){
            throw new NotFoundException('Conversation does not exist');
        }
        const countMessages = await this.chatRepository.countMessageInConversationById(conversation?.id, userId);
        if(countMessages){
            await this.chatRepository.markAsRead(conversation.id, userId)
        }

        return await this.conservationRepository.getConversationById(id, userId);
    }

    async getAllConversationByUserId(userId: number){
        return await this.conservationRepository.getAllConservationByUserId(userId)
    }
}

