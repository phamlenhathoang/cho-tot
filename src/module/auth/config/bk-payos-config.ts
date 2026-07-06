import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class BkPayosConfig{
    constructor(
        private readonly configService: ConfigService
    ){} 

    getBkClientID(){
        return this.configService.getOrThrow<string>("BK_CLIENT_ID");
    }

    getBkApiKey(){
        return this.configService.getOrThrow<string>("BK_API_KEY")
    }

    getBkCheckSum(){
        return this.configService.getOrThrow<string>("BK_CHECKSUM")
    }

    getReturnUrl(){
        return this.configService.getOrThrow<string>("RETURN_URL")
    }

    getCancelUrl(){
        return this.configService.getOrThrow<string>("CANCEL_URL")
    }

    getBkUrl(){
        return this.configService.getOrThrow<string>("PAYOS_URL")
    }
} 