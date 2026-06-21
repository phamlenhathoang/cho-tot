import { Body, Controller, Post, Query } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { StatusOrderTracking } from '@prisma/client';
import { CreateTrackingDTO } from './dto/create-tracking-dto';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('create')
  async createTracking(@Body() createTrackingDto: CreateTrackingDTO){
    return await this.trackingService.createTracking(createTrackingDto)
  }
}
