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
import { TransactionService } from '../transaction/tracsaction.service';
import { OfferModule } from '../offer/offer.module';

@Module({
  imports:[UserModule, PostModule, MapModule, HttpModule, GhnModule, 
    forwardRef(() => OfferModule),
    forwardRef(() => TrackingModule)
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, GHTKConfig, TransactionService],
  exports: [OrderService, OrderRepository]
})
export class OrderModule {}
