import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressRepository } from './address.repository';
import { UserModule } from '../user/user.module';
import { GhnModule } from '../ghn/ghn.module';

@Module({
  imports:[UserModule, GhnModule],
  controllers: [AddressController],
  providers: [AddressService, AddressRepository],
})
export class AddressModule {}
