import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

@Injectable()
export class GHTKConfig {
    private header;
    private baseUrl;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {
        this.header = this.configService.get<string>("GHTK_API_KEY"),
            this.baseUrl = this.configService.get<string>("GHTK_BASE_URL");
    }

    private normalizeProvince(city: string): string {
    return city
        .replace(/^Thành phố\s+/i, '')
        .replace(/^Tỉnh\s+/i, '')
        .trim();
}

    async getShipFee(addressBuyer: any, addressSeller: any, weight: number, value: number) {
        const res = await firstValueFrom(
            this.httpService.get(
                `${this.baseUrl}/services/shipment/fee`,
                {
                    headers: {
                        Token: this.header,
                    },
                    params: {
                        pick_province: this.normalizeProvince(addressSeller.city),
                        pick_district: addressSeller.district,

                        province: addressBuyer.city,
                        district: addressBuyer.district,

                        address: addressBuyer.street,

                        weight: weight,
                        value: value,
                    }
                }
            )
        )

        return Number(res.data.fee.fee)
    }
}