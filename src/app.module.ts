import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { CategotyModule } from './module/categoty/category.module';
import { ThumpnailModule } from './module/thumpnail/thumpnail.module';
import { PostModule } from './module/post/post.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './log/logger.middleware';
import { ChatModule } from './module/chat/chat.module';
import { OrderModule } from './module/order/order.module';
import { MapModule } from './module/map/map.module';
import { TwilioModule } from './module/twilio/twilio.module';
import { OfferModule } from './module/offer/offer.module';
import { TransactionService } from './module/transaction/tracsaction.service';
import { GhnModule } from './module/ghn/ghn.module';
import { AddressModule } from './module/address/address.module';
import { TrackingModule } from './module/tracking/tracking.module';

@Module({
  imports: [UserModule, AuthModule, CategotyModule, ThumpnailModule, PostModule, ChatModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule,
    OrderModule,
    MapModule,
    TwilioModule,
    OfferModule,
    GhnModule,
    AddressModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService, TransactionService],
  exports:[TransactionService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
