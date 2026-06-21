import { Body, Controller, Get, HttpCode, Logger, Post, Query } from '@nestjs/common';
import { GhnService } from './ghn.service';
import { GetWardCodeDTO } from './dto/getwardcode.dto';
import { get } from 'axios';
import { GetDistrictIdDTO } from './dto/get-district-id.dto';
import { GetShipFeeDTO } from './dto/get-ship-fee.dto';
import { CreateGHNOrderDTO } from './dto/create-ghn-order.dto';
import { GhnCallbackDto } from './dto/ghn-callback.dto';

@Controller('ghn')
export class GhnController {

  private readonly logger = new Logger(GhnController.name);

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
    @Query('addressSellerId') addressSellerId: number,
    @Query('addressBuyerId') addressBuyerId: number,
  ) {

    
    return this.ghnService.canShip(
      Number(addressSellerId),
      Number(addressBuyerId),
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

  @Post()
  @HttpCode(200) // QUAN TRỌNG: luôn 200, GHN sẽ retry 10 lần x 5s nếu không phải 200
  async handleCallback() {
    // this.logger.log(`Nhận callback GHN: ${payload.CodeId} -> ${payload.Status}`);

    // try {
    //   await this.ghnService.processCallback(payload);
    // } catch (error) {
    //   // Log lỗi nội bộ, KHÔNG throw ra ngoài để tránh GHN retry liên tục
    //   this.logger.error(`Lỗi xử lý callback ${payload.CodeId}`, error);
    // }

    return { success: true };
  }
}
