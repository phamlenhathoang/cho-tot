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

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post('vnpay/create/:orderId')
  async createPayment(@Param('orderId') orderId: string, @Req() req) {
    const ipAddr = '127.0.0.1'
    const paymentUrl = await this.paymentService.createPaymentUrl(Number(orderId), ipAddr, req.user.id);
    return { paymentUrl };
  }

  @Get('vnpay/ipn')
  @HttpCode(200)
  async handleIpn(@Req() req) {
    const query = req.query as Record<string, string>;
    return this.paymentService.handleIpn(query);
  }

  // @Get('vnpay/return')
  // async vnpayReturn(@Query() query: any) {
  //   return query; // tạm thời để xem raw response, sau verify checksum như IPN
  // }

  @Get('vnpay/return')
  async handleReturn(@Req() req, @Res() res) {
    const isSuccess = req.query['vnp_ResponseCode'] === '00';
    const frontendUrl = isSuccess
      ? `${process.env.FRONTEND_URL}/payment/success`
      : `${process.env.FRONTEND_URL}/payment/failed`;

    return res.redirect(frontendUrl);
  }

  /**
   * Buyer xác nhận đã nhận hàng -> release tiền (mock, xem comment trong service).
   * TODO: thay buyerId hardcode bằng @CurrentUser() khi đã gắn JWT guard.
   */
  @Post('confirm-received/:orderId')
  async confirmReceived(@Param('orderId') orderId: string) {
    const buyerId = 1; // TODO: lấy từ JWT token thật
    return this.paymentService.confirmReceived(Number(orderId), buyerId);
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
}
