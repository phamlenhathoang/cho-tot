import { Injectable } from '@nestjs/common';
import { ChatRepo } from './chat.repository';

@Injectable()
export class ChatService {
    constructor(private readonly chatRepo: ChatRepo){}

    async save(chat: any){
        return await this.chatRepo.save(chat)
    }
}
