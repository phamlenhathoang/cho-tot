import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Twilio from "twilio";
import * as nodemailer from "nodemailer";

@Injectable()
export class TwilioConfig {
  public readonly client: Twilio.Twilio;
  public readonly transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.client = Twilio(
      this.configService.getOrThrow("TWILIO_SID"),
      this.configService.getOrThrow("TWILIO_AUTH_TOKEN"),
    );

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.configService.getOrThrow("MAIL_USER"),
        pass: this.configService.getOrThrow("MAIL_PASS"),
      },
    });
  }

  get verifySid() {
    return this.configService.getOrThrow("TWILIO_VERIFY_SERVICE_SID");
  }

  get mailUser() {
    return this.configService.getOrThrow("MAIL_USER");
  }
}