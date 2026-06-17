import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GhnService } from './ghn.service';
import { GetWardCodeDTO } from './dto/getwardcode.dto';
import { get } from 'axios';
import { GetDistrictIdDTO } from './dto/get-district-id.dto';
import { GetShipFeeDTO } from './dto/get-ship-fee.dto';
import { CreateGHNOrderDTO } from './dto/create-ghn-order.dto';

@Controller('ghn')
export class GhnController {
  constructor(private readonly ghnService: GhnService) { }

  @Get('get-city-id')
  async getCityId(@Query('city') city: string) {
    return await this.ghnService.getCityId(city)
  }

  @Get('get-ward-code')
  async getWardCode(@Query() getWardCode: GetWardCodeDTO) {
    return await this.ghnService.getWardCode(getWardCode.ward, getWardCode.districtId);
  }

  @Get('get-district-id')
  async getdDstrictCode(@Query() getDisctrictDto: GetDistrictIdDTO) {
    return await this.ghnService.getDistrictId(getDisctrictDto.district, getDisctrictDto.provinceId);
  }

  @Get('available-service')
  async getAvailableServices(
    @Query('fromDistrictId') fromDistrictId: number,
    @Query('toDistrictId') toDistrictId: number,
  ) {
    return this.ghnService.canShip(
      Number(fromDistrictId),
      Number(toDistrictId),
    );
  }

  @Get('ship-fee')
  async getShipFee(@Query() getShipFee: GetShipFeeDTO){
    return await this.ghnService.getShipFee(getShipFee);
  }

  @Post('create-ghn-order')
  async createGhnOrder(@Body() createGhnOrder: CreateGHNOrderDTO){
    console.log("BODY RECEIVED:", createGhnOrder);
    return await this.ghnService.createGHNOrder(createGhnOrder);
  }
}
