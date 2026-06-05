import { Body, Controller, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { OfferService } from './offer.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards/jwt-auth.guards.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { OfferDTO } from './dto/offer.dto';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Put('accept-offer')
  async updateStatusOffer(@Req() rq, @Query('offerId')offerId : number){
    return await this.offerService.acceptOffer(offerId, rq.user)
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post('create-offer')
  async createOffer(@Req() rq, @Body()offer : OfferDTO){
    return await this.offerService.createOffer(offer, rq.user)
  }
}
