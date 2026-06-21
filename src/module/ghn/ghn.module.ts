import { forwardRef, Module } from '@nestjs/common';
import { GhnService } from './ghn.service';
import { GhnController } from './ghn.controller';
import { GHNConfig } from '../auth/config/ghn.config';
import { HttpModule } from '@nestjs/axios';
import { AddressModule } from '../address/address.module';
import { OrderModule } from '../order/order.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [HttpModule, AddressModule,
    forwardRef(() => AddressModule),
    forwardRef(() => OrderModule),
    forwardRef(() => TrackingModule),
  ],
  controllers: [GhnController],
  providers: [GhnService, GHNConfig],
  exports: [GhnService]
})
export class GhnModule { }
