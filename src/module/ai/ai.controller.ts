import { Controller, Get, Post, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai'

@Controller('ai')
export class AiController {

  constructor(private readonly aiService: AiService) {}

  @Get()
  async getResponse(@Query('query') query: string) {
    return await this.aiService.getResponse(query);
  }

  @Get('search-google')
  async searchGoogle(@Query('query') query: string){
    return await this.aiService.search(query);
  }

  @Post('create-image')
  async createImage(@Query('prompt')prompt: string){
    return await this.aiService.createImage(prompt);
  }
}
