import { Controller, Get, Query } from '@nestjs/common';
import { MapService } from './map.service';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  // @Get('geocode')
  // geocode(@Query('address') address: string) {
  //   return this.mapService.geocode(address);
  // }

  // @Get('distance')
  // distance(
  //   @Query('origin') origin: string,
  //   @Query('destination') destination: string,
  // ) {
  //   return this.mapService.getDistance(origin, destination);
  // }
}
