import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class GHNConfig{
    constructor(
        private readonly configService: ConfigService,){}

    get baseUrl(){
        return this.configService.get<string>("GHN_BASE_URL");
    }

    get shopApi(){
        return this.configService.get<string>("GHN_SHOP_ID");
    }

    get tokenApi(){
        return this.configService.get<string>("GHN_TOKEN_API")
    }

    get shopId(){
        return this.configService.get<string>("GHN_SHOP_ID")
    }
}
