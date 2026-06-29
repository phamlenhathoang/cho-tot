import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class VNPAYConfig{
    constructor(
        private readonly configService: ConfigService
    ){}

    getTmnCode(){
        return this.configService.getOrThrow<string>("VNP_TMNCODE")
    }

    getHashSecret(){
        return this.configService.getOrThrow<string>("VNP_HASHSECRET")
    }

    getUrl(){
        return this.configService.getOrThrow<string>("VNP_URL")
    }

    getReturnUrl(){
        return this.configService.getOrThrow<string>("VNP_RETURN_URL")
    }

    getVpnIpnUrl(){
        return this.configService.getOrThrow<string>("VNP_RETURN_URL")
    }
}