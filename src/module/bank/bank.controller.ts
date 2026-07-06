import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards/jwt-auth.guards.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) { }

  @Get()
  async getBankBin(@Query('shortName') shortName: string){
    return await this.bankService.getBinByShortName(shortName);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post()
  async createBank(@Body() createBankDTO: CreateBankDto, @Req() req) {
    return await this.bankService.createBank(createBankDTO, req.user.id);
  }
}
