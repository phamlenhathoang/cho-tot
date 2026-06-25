import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { CreateConversationDto } from './dto/create-conversation';

@Injectable()
export class ConversationService {
    constructor(
        private readonly conservationRepository: ConversationRepository
    ){}

    async createOrGetConversation(createConversationDto: CreateConversationDto, buyerId: number){

        if(createConversationDto.sellerId ===  buyerId){
            throw new ForbiddenException("Can not create conversation with myself");
        }
        const conservation = await this.conservationRepository.getConversation(createConversationDto.postId, buyerId, createConversationDto.sellerId);
        if(!conservation){
            return await this.conservationRepository.createConversation(createConversationDto.postId, buyerId, createConversationDto.sellerId);
        }

        return conservation;
    }

    async getConversationById(id: number, userId: number){
        return await this.conservationRepository.getConversationById(id, userId)
    }
}
