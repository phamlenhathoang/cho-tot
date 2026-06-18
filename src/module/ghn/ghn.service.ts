import { Injectable, NotFoundException } from '@nestjs/common';
import { GHNConfig } from '../auth/config/ghn.config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { GetShipFeeDTO } from './dto/get-ship-fee.dto';
import { CreateGHNOrderDTO } from './dto/create-ghn-order.dto';
import { TrackingService } from '../tracking/tracking.service';
import { AddressRepository } from '../address/address.repository';

@Injectable()
export class GhnService {
    constructor(
        private readonly ghnConfig: GHNConfig,
        private readonly httpService: HttpService,
        private readonly addressRepository: AddressRepository
    ) { }

    private get headers() {
        return {
            Token: this.ghnConfig.tokenApi,
            ShopId: Number(this.ghnConfig.shopApi),
            'Content-Type': 'application/json',
        };
    }

    async getCityId(city: string) {
        const response = await firstValueFrom(
            this.httpService.get(
                `${this.ghnConfig.baseUrl}/shiip/public-api/master-data/province`,
                {
                    headers: this.headers
                }
            )
        )

        return response.data.data.find(
            (item: any) =>
                item.ProvinceName.toLowerCase() === city.toLowerCase()
        )


    }

    async getWardCode(ward: string, districtId: number) {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.ghnConfig.baseUrl}/shiip/public-api/master-data/ward`,
                {
                    district_id: districtId,
                },
                {
                    headers: this.headers
                },
            )
        );

        return response.data.data.find(
            (item: any) =>
                item.WardName.toLowerCase() === ward.toLowerCase()
        )
    }

    async getDistrictId(district: string, provinceId: number) {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.ghnConfig.baseUrl}/shiip/public-api/master-data/district`,
                {
                    province_id: provinceId
                }, {
                headers: this.headers
            }
            )
        )

        return response.data.data.find(
            (item: any) =>
                item.DistrictName.toLowerCase() === district.toLowerCase()
        )
    }

    async getAvailableServices(districtBuyer: number, districtSeller: number) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(
                    `${this.ghnConfig.baseUrl}/shiip/public-api/v2/shipping-order/available-services`,
                    {
                        shop_id: Number(this.ghnConfig.shopApi),
                        from_district: districtBuyer,
                        to_district: districtSeller,
                    }, {
                    headers: this.headers
                }
                )
            )

            return data;
        } catch (error) {
            throw error;
        }
    }

    async canShip(
        addressSellerDistrictId: number,
        addressBuyerDistrictId: number,
    ) {
        
        // const addressSeller = await this.addressRepository.getAddressById(addressSellerId);
        // const addressBuyer = await this.addressRepository.getAddressById(addressBuyerId);
    
        // console.log(addressBuyer?.districtId + "  " + addressSeller?.districtId)
        // if(!addressSeller || !addressSeller.districtId || !addressBuyer || !addressBuyer.districtId){
        //     throw new NotFoundException("User or districtId user does not exist");
        // }

        const services = await this.getAvailableServices(
            addressSellerDistrictId,
            addressBuyerDistrictId,
        );

        return {
            canShip: services?.data?.length > 0,
            services: services?.data || [],
        };
    }

    async getShipFee(getShipFeeDto: GetShipFeeDTO) {
        try {
            const body = {
                from_district_id: getShipFeeDto.districtBuyer,
                service_id: getShipFeeDto.serviceId,
                to_district_id: getShipFeeDto.districtSeller,
                value: getShipFeeDto.value,
                width: getShipFeeDto.width,
                weight: getShipFeeDto.weight,
                height: getShipFeeDto.height,
                length: getShipFeeDto.length,
            }
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.ghnConfig.baseUrl}/shiip/public-api/v2/shipping-order/fee`,
                    body,
                    {
                        headers: this.headers
                    }
                )
            )

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createGHNOrder(order: CreateGHNOrderDTO) {
        try {

            const payload = {
                content: order.content,

                from_name: order.fromName,
                from_phone: order.fromPhone,
                from_address: order.fromAddress,
                from_ward_name: order.fromWard,
                from_district_id: order.fromDistrictId,

                // thông tin người nhận
                to_name: order.toName,
                to_phone: order.toPhone,
                to_address: order.toAddress,
                to_ward_name: order.toWard,
                to_ward_code: order.toWardCode,
                to_district_id: order.toDistrictId,

                // hàng hóa
                weight: order.weight, // gram
                length: order.length,
                width: order.width,
                height: order.height,

                // COD
                cod_amount: order.codAmount || 0,

                // giá trị hàng hóa (insurance base)
                value: order.value || 0,

                // service
                service_id: order.serviceId,

                // optional
                payment_type_id: 2, // 1: người gửi trả, 2: người nhận trả
                required_note: 'CHOXEMHANGKHONGTHU',
            };

            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.ghnConfig.baseUrl}/shiip/public-api/v2/shipping-order/create`,
                    payload,
                    {
                        headers: this.headers
                    }
                )
            )

            return response.data.data.order_code;
        } catch (error) {
            throw error
        }
    }

    async getTrackingInfo(orderCode: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.ghnConfig.baseUrl}/shiip/public-api/v2/shipping-order/detail`,
                    {
                        order_code: orderCode
                    },  
                    {
                        headers: this.headers
                    }
                )
            )
            return response.data.data.status;
        } catch (error) {
            throw error;
        }
    }
}
