import { forwardRef, Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { OfferGateway } from '../auth/config/offer-gateway.config';
import { WsJwtGuard } from '../auth/guards/ws-jwt/ws-jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { OfferRepository } from './offer.repository';
import { TransactionTrackingService } from '../transaction-tracking/tracsaction-tracking.service';
import { OrderModule } from '../order/order.module';
import { PostModule } from '../post/post.module';
import { GhnModule } from '../ghn/ghn.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    forwardRef(() => OrderModule),
    PostModule, GhnModule
  ],
  controllers: [OfferController],
  providers: [OfferService, OfferGateway, WsJwtGuard, OfferRepository, TransactionTrackingService],
  exports: [OfferService, OfferRepository]
})
export class OfferModule { }
