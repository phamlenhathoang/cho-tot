import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GetMessagesDto } from './dto/get-messages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards/jwt-auth.guards.guard';
import { SendMessageDto } from './dto/send-messge.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('chat')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get(':id')
  async getMessages(
    @Param('id') id: number,
    @Query() dto: GetMessagesDto,
    @Req() req,
  ) {
    return this.chatService.getMessages(id, dto, req.user.id);
  }

  @Post()
  async sendMessage(@Body() dto: SendMessageDto, @Req() rq) {
    return this.chatService.sendMessage(dto, rq.user.id);
  }
}
