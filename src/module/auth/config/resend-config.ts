import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from 'resend'

@Injectable()
export class ResendConfig{

    public readonly resend: Resend

    constructor(
        private readonly config: ConfigService
    ){
        this.resend = new Resend(
            this.config.getOrThrow<string>("RESEND_API_KEY")
        )
    }
}