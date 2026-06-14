import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressRepository } from './address.repository';
import { SaveAddressDTO } from './dto/save-address.dto';
import { UserRepo } from '../user/user.repository';
import { GhnService } from '../ghn/ghn.service';

@Injectable()
export class AddressService {
    constructor(
        private readonly addressRepository: AddressRepository,
        private readonly userRepo: UserRepo,
        private readonly ghnService: GhnService
    ){}

    async saveAddress(addressDto: SaveAddressDTO){
        try {
            const user = await this.userRepo.getById(addressDto.userId);
            if(!user){
                throw new NotFoundException("User does not exist");
            }

            const cityId = await this.ghnService.getCityId(addressDto.city);
            if(!cityId){
                throw new NotFoundException("Can not find cityId");
            }
            const districtId = await this.ghnService.getDistrictId(addressDto.district, cityId.ProvinceID);
            if(!districtId){
                throw new NotFoundException("Can not find districtId");
            }
            const wardCode = await this.ghnService.getWardCode(addressDto.ward, districtId.DistrictID);
            if(!wardCode){
                throw new NotFoundException("Can not find wardCode");
            }

            return await this.addressRepository.saveAddress({
                userId: user.id,
                city: addressDto.city,
                cityId: cityId.ProvinceID,
                district: addressDto.district,
                districtId: districtId.DistrictID,
                ward: addressDto.ward,
                wardCode: Number(wardCode.WardCode),
                street: addressDto.street,
            })
        } catch (error) {
            throw error;
        }
    }
}
