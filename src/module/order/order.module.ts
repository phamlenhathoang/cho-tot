import { forwardRef, Module,  } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { MapModule } from '../map/map.module';
import { GHTKConfig } from '../auth/config/ghtk.config';
import { HttpModule } from '@nestjs/axios';
import { GhnModule } from '../ghn/ghn.module';
import { TrackingModule } from '../tracking/tracking.module';
import { TransactionTrackingService } from '../transaction-tracking/tracsaction-tracking.service';
import { OfferModule } from '../offer/offer.module';
import { PaymentModule } from '../payment/payment.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports:[UserModule, PostModule, MapModule, HttpModule, TransactionModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => OfferModule),
    forwardRef(() => TrackingModule),
    forwardRef(() => GhnModule),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, GHTKConfig, TransactionTrackingService],
  exports: [OrderService, OrderRepository]
})
export class OrderModule {}
