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
import { TransactionTrackingService } from './module/transaction-tracking/tracsaction-tracking.service';
import { GhnModule } from './module/ghn/ghn.module';
import { AddressModule } from './module/address/address.module';
import { TrackingModule } from './module/tracking/tracking.module';
import { RedisModule } from './module/redis/redis.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AiModule } from './module/ai/ai.module';
import { CloudnaryModule } from './module/cloudnary/cloudnary.module';
import { ConversationModule } from './module/conversation/conversation.module';
import { PaymentModule } from './module/payment/payment.module';
import { TransactionModule } from './module/transaction/transaction.module';

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
    RedisModule,
    AiModule,
    CloudnaryModule,
    ConversationModule,
    PaymentModule,
    TransactionModule,

    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'module','chat','html'), // Đường dẫn tới thư mục chứa index.html
    // }),
  ],
  controllers: [AppController],
  providers: [AppService, TransactionTrackingService],
  exports:[TransactionTrackingService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
