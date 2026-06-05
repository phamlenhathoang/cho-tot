import { forwardRef, Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { TrackingRepository } from './tracking.repository';
import { GhnModule } from '../ghn/ghn.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [GhnModule, 
    forwardRef(() => OrderModule)
  ],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingRepository],
  exports: [TrackingService]
})
export class TrackingModule {}
