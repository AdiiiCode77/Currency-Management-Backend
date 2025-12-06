import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from '../application/otp.service';
import { SendOtpDto } from '../domain/dto/send.dto';
import { VerifyOtpDto } from '../domain/dto/verify.dto';
import { ResetPasswordDto } from '../domain/dto/reset.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('OTP')
@Controller('/api/v1/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/send')
  @ApiOperation({
    summary: 'Send OTP',
    description:
      'Sends a One-Time Password (OTP) to the provided email for verification.',
  })
  @ApiBody({
    description: 'Email or phone to send OTP to',
    schema: {
      example: {
        // email: 'user@example.com',
        phone: '+923001234567',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully.',
  })
  async SendOtp(@Body() body: SendOtpDto) {
    try {
      return this.otpService.Send(body);
    } catch (error) {
      return error;
    }
  }

  @Post('/verify')
  @ApiOperation({
    summary: 'Verify OTP',
    description:
      'Verifies the OTP sent to the user email or phone. Must be called after `/send`.',
  })
  @ApiBody({
    description: 'Email/phone and OTP to verify',
    schema: {
      example: {
        // email: 'user@example.com',
        phone: '+923001234567',
        otp: '123456',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully.',
  })
  async VerifyOtp(@Body() body: VerifyOtpDto) {
    try {
      return this.otpService.Verify(body);
    } catch (error) {
      throw error;
    }
  }

  @Post('/reset-password')
  @ApiOperation({
    summary: 'Reset Password',
    description:
      'Resets the password for the given user. Usually called after OTP verification.',
  })
  @ApiBody({
    description: 'User ID and new password',
    schema: {
      example: {
        userId: '017767af-8e93-4579-bb6a-c6acce52941c',
        password: 'newSecurePassword123',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
  })
  async ResetPassword(@Body() body: ResetPasswordDto) {
    try {
      return this.otpService.ResetPassword(body);
    } catch (error) {
      throw error;
    }
  }
}
