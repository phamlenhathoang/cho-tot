import { forwardRef, Logger, Module, OnModuleInit } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { VNPAYConfig } from '../auth/config/vnpay-config';
import { TransactionModule } from '../transaction/transaction.module';
import { TransactionTrackingService } from '../transaction-tracking/tracsaction-tracking.service';
import { PayosConfig } from '../auth/config/payos-config';
import { BkPayosConfig } from '../auth/config/bk-payos-config';
import { UserModule } from '../user/user.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [TransactionModule, UserModule, forwardRef(() => OrderModule), TransactionModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, VNPAYConfig, TransactionTrackingService, PayosConfig, BkPayosConfig],
  exports: [PaymentService, PaymentRepository]
})
export class PaymentModule implements OnModuleInit {

  private readonly logger = new Logger(PaymentModule.name);

  constructor(private readonly paymentService: PaymentService) { }


  async onModuleInit() {
    try {
      await this.paymentService.confirmWebhookUrl();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Confirm webhook thất bại: ${message}`);
    }
  }
}
