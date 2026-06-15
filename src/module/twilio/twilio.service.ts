import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Twilio from 'twilio';
import { TwilioConfig } from '../auth/config/twilio.config';
import { RedisService } from '../redis/redis.service';
import { UserRepo } from '../user/user.repository';

@Injectable()
export class TwilioService {

    constructor(
        private readonly twilioConfig: TwilioConfig,
        private readonly redisService: RedisService,
        private readonly userRepo: UserRepo
    ) { }

    async sendVoiceOtp(phone: string, type: string) {
        try {
            const phone = "+84395760997";

            const result = phone.replace("+84", "0");
            const user = await this.userRepo.getUserByPhone(result);
            if (!user) {
                throw new NotFoundException("User does not exist");
            }
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
            const user = await this.userRepo.getUserByPhone(phone);
            if (!user) {
                throw new NotFoundException("User does not exist");
            }
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

    async sendOtpMail(email: string, otp?: string) {
        await this.redisService.set('test', 'hello');

        const value = await this.redisService.get('test');

        console.log(value);
        await this.twilioConfig.getTransporterlog();
        const user = await this.userRepo.getUserByEmailAndPhone(email, null);
        if (!user) {
            throw new NotFoundException("User does not exist");
        }
        if (!otp) {
            const otp = Math.floor(
                100000 + Math.random() * 900000
            ).toString();
            await this.redisService.set(email, otp, 300);
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
        } else {
            const storedOtp = await this.redisService.get(email);
            if (!storedOtp) {
                throw new BadRequestException(
                    'OTP expired'
                );
            }

            if (storedOtp !== otp) {
                throw new BadRequestException(
                    'OTP invalid'
                );
            }

            await this.redisService.delete(
                `email`,
            );
        }

        return {
            success: true,
        };
    }
}
