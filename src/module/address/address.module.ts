import { forwardRef, Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressRepository } from './address.repository';
import { UserModule } from '../user/user.module';
import { GhnModule } from '../ghn/ghn.module';

@Module({
  imports:[UserModule, forwardRef(() => GhnModule)],
  controllers: [AddressController],
  providers: [AddressService, AddressRepository],
  exports: [AddressRepository]
})
export class AddressModule {}
