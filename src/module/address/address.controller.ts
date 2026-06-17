import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AddressService } from './address.service';
import { SaveAddressDTO } from './dto/save-address.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) { }

  @Post('save-address')
  async saveAddress(@Body() addressDTO: SaveAddressDTO) {
    return await this.addressService.saveAddress(addressDTO);
  }

  @Get('get-address-by-user-id')
  async getAddressByUserId(@Query('id') userId: number) {
    return await this.addressService.getAddressByUserId(userId);
  }
}
