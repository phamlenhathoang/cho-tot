import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards/jwt-auth.guards.guard';

@Controller('conversation')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async createConservation(@Body() dto: CreateConversationDto, @Req() req){
      return await this.conversationService.createOrGetConversation(dto, req.user.id)
  }

  @Get('id')
  async getConversation(@Req() rq, @Param('id') id: number,){
      return await this.conversationService.getConversationById(id, rq.user.id)
  }
}
