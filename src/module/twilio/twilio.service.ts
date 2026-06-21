import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TwilioConfig } from '../auth/config/twilio.config';
import { RedisService } from '../redis/redis.service';
import { UserRepo } from '../user/user.repository';
import { ResendConfig } from '../auth/config/resend-config';

@Injectable()
export class TwilioService {

    constructor(
        private readonly twilioConfig: TwilioConfig,
        private readonly redisService: RedisService,
        private readonly userRepo: UserRepo,
        private readonly resendConfig: ResendConfig
    ) { }

    async sendVoiceOtp(phone: string, type: string) {
        try {
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
            const result = phone.replace("+84", "0");
            const user = await this.userRepo.getUserByPhone(result);
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

    async sendOtpMail(email: string, newPassword?: string) {
        const user = await this.userRepo.getUserByEmailAndPhone(email, null);
        if (!user) {
            throw new NotFoundException("User does not exist");
        }
        if (!newPassword) {
            const newPassword = Math.floor(
                100000 + Math.random() * 900000
            ).toString();

            await this.redisService.set(email, newPassword, 300);
            await this.userRepo.updatePassword(newPassword, user.id);

            await this.resendConfig.resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Verify new password',
                html: `
                    <h2>Your new password</h2>
                    <h1>${newPassword}</h1>
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

            if (storedOtp !== newPassword) {
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
