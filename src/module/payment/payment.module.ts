import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { VNPAYConfig } from '../auth/config/vnpay-config';
import { OrderModule } from '../order/order.module';
import { TransactionModule } from '../transaction/transaction.module';
import { TransactionTrackingService } from '../transaction-tracking/tracsaction-tracking.service';

@Module({
  imports:[OrderModule, TransactionModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, VNPAYConfig, TransactionTrackingService],
})
export class PaymentModule {}
