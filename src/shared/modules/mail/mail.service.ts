import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtpEmail(to: string, name: string, otp: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Your OTP Code',
      template: './otp',
      context: {
        name,
        otp,
      },
    });
  }

}
