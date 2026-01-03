import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../users/domain/entities/user.entity';
import { Repository } from 'typeorm';
import { OtpEntity } from '../domain/entities/otp.entity';
import { generateOtp } from '../../../shared/helpers/generateOTP';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/shared/modules/mail/mail.service';
import {
  IResetPassword,
  ISendOtp,
  IVerifyOtp,
} from '../domain/types/otp.types';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    private mailService: MailService,
  ) {}

  private async findUserByEmailOrPhone(email?: string, phone?: string) {
    if (!email && !phone) {
      throw new BadRequestException(['Please provide either an email address or phone number to proceed.']);
    }

    let user: UserEntity | null = null;

    if (email) {
      user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });
    } else if (phone) {
      user = await this.userRepository.findOne({
        where: { phone },
      });
    }

    if (!user) {
      throw new BadRequestException([
        'Unable to send verification code. Please check your information and try again.',
      ]);
    }

    return user;
  }

  async Send(body: ISendOtp) {
    const user = await this.findUserByEmailOrPhone(body?.email, body?.phone);

    await this.otpRepository.delete({ userId: user.id });

    const otp = generateOtp(6);
    await this.otpRepository.save({
      id: uuidv4(),
      userId: user.id,
      code: otp,
    });

    if (body?.email) {
      this.mailService.sendOtpEmail(user.email, user.name, otp);
    }

    return {
      message: `OTP sent successfully to ${body.email || body.phone}`,
      // testingOtp: otp
    };
  }

  async Verify(body: IVerifyOtp) {
    const user = await this.findUserByEmailOrPhone(body.email, body.phone);

    const otp = await this.otpRepository.findOne({
      where: { userId: user.id },
    });

    if (!otp || otp.code !== body.otp) {
      throw new BadRequestException(['The verification code is invalid or has expired. Please request a new code.']);
    }

    await this.otpRepository.delete({ userId: user.id });

    return {
      message: 'OTP verified successfully',
      userId: user.id,
    };
  }

  async ResetPassword(body: IResetPassword) {
    const user = await this.userRepository.findOne({
      where: { id: body.userId },
    });

    if (!user) {
      throw new BadRequestException(['Unable to reset password. Please try the password reset process again.']);
    }

    user.password = await bcrypt.hash(body.password, 10);
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }
}
