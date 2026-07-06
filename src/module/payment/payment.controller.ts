import { Body, Controller, Get, HttpCode, Logger, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards/jwt-auth.guards.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('payment')
export class PaymentController {

  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) { }


  @Get('vnpay/return')
  async handleReturn(@Req() req, @Res() res) {
    const isSuccess = req.query['vnp_ResponseCode'] === '00';
    const frontendUrl = isSuccess
      ? `${process.env.FRONTEND_URL}/payment/success`
      : `${process.env.FRONTEND_URL}/payment/failed`;

    return res.redirect(frontendUrl);
  }


  @ApiBearerAuth('access-token')
  @Post('create-link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  async createLink(@Query('amount') amount: number, @Req() req) {
    return await this.paymentService.createPaymentPayOsUrl(
      amount
    );
  }

  // @Post('test-refund')
  // async testRefund(
  //   @Query('amount') amount: number,
  //   @Query('toBin') toBin: string,
  //   @Query('toAccountNumber') toAccountNumber: string,
  // ) {
  //   return this.paymentService.refund(amount, toBin, toAccountNumber);
  // }

  @Get('debug-ip')
  async debugIp() {
    const res = await fetch('https://api.ipify.org?format=json');
    return res.json();
  }

  @Post('thu')
  @HttpCode(200) // PayOS cần nhận 200 mới coi là đã xử lý thành công
  async handleThuWebhook(@Body() body: any) {
    this.logger.log(`Nhận webhook Thu: ${JSON.stringify(body)}`);
    
    return this.paymentService.handlePaymentWebhook(body);
  }

  @Post('payout-webhook')
  @HttpCode(200) // PayOS cần nhận 200 mới coi là đã xử lý thành công
  async handlePayOutWebhook(@Body() body: any) {
    this.logger.log(`Nhận webhook Payout: ${JSON.stringify(body)}`);
    
    return this.paymentService.handlePaymentPayOutWebhook(body);
  }
}
