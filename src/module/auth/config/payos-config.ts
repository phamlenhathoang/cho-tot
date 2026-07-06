import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PayosConfig{
    constructor(
        private readonly configService: ConfigService
    ){}

    getClientID(){
        return this.configService.getOrThrow<string>("PAYOS_CLIENT_ID");
    }

    getApiKey(){
        return this.configService.getOrThrow<string>("PAYOS_API_KEY")
    }

    getCheckSum(){
        return this.configService.getOrThrow<string>("PAYOS_CHECKSUM")
    }

    getReturnUrl(){
        return this.configService.getOrThrow<string>("RETURN_URL")
    }

    getCancelUrl(){
        return this.configService.getOrThrow<string>("CANCEL_URL")
    }
}