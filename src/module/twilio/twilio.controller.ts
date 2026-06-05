import { Body, Controller, Post } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { SendMailOtpDto } from './dto/send-mail-otp.dto';

@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) { }

  @Post("forgot-password")
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.twilioService.sendVoiceOtp(forgotPasswordDto.phone, forgotPasswordDto.type)
  }

  @Post("verify-voice-otp")
  async verifyVoiceOtp(@Body() body: { phone: string, code: string }) {
    return await this.twilioService.verifyVoiceOtp(body.phone, body.code)
  }

  @Post("send-mail-otp")
  async sendOtpMail(@Body() sendMailOtpDTO : SendMailOtpDto) {
    return await this.twilioService.sendOtpMail(sendMailOtpDTO.email)
  }
  
}
