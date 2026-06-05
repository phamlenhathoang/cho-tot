import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Twilio from 'twilio';
import { TwilioConfig } from '../auth/config/twilio.config';

@Injectable()
export class TwilioService {

    constructor(
        private readonly twilioConfig: TwilioConfig
    ) {}

    async sendVoiceOtp(phone: string, type: string) {
        try {
            const response = await this.twilioConfig.client.verify.v2
                .services(this.twilioConfig.verifySid)
                .verifications.create({
                    to: phone,
                    channel: type
                });

            return {
                success: true,
                expiredIn: 300
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    async verifyVoiceOtp(phone: string, code: string) {
        try {
            const response = await this.twilioConfig.client.verify.v2
                .services(this.twilioConfig.verifySid)
                .verificationChecks.create({
                    to: phone,
                    code,
                });

            return {
                success: response.status === "approved",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    async sendOtpMail(
        email: string,
    ) {

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await this.twilioConfig.transporter.sendMail({
            from: this.twilioConfig.mailUser,
            to: email,
            subject: "Verify OTP",
            html: `
        <h2>Your OTP Code</h2>

        <h1>${otp}</h1>

        <p>OTP expires in 5 minutes.</p>
      `,
        });

        return {
            success: true,
        };
    }
}
