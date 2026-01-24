//auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from '../application/auth.service';
import { CreateUserDto, SignupFirstStepDTO } from '../domain/dto/signup.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminLoginDto } from '../domain/dto/admin-login.dto';
import { ISignupFirstStep, ISignupSecondStep } from '../domain/types/auth-types';

@ApiTags('Authentication')
@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/phone/check/:phone')
  @ApiOperation({
    summary: 'API to check if user exists with provided phone number or not',
  })
  @ApiParam({
    name: 'phone',
    required: true,
    description: 'The phone number to check (e.g., +923001234567)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        exists: {
          type: 'boolean',
          description: 'True if phone number exists, false otherwise',
          example: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Any Server Error',
  })
  async checkPhone(@Param('phone') phone: string) {
    return this.authService.checkPhoneExistence(phone);
  }

  // @Post('/signup/first-step')
  // @ApiOperation({
  //   summary: 'Signup Step 1: Collect user info and send OTP',
  //   description: 'Validates user data, sends OTP to email.',
  // })
  // @ApiBody({
  //   description: 'User signup initial data',
  //   schema: {
  //     example: {
  //       email: 'test@example.com',
  //     },
  //   },
  // })
  // @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  // @ApiResponse({ status: 400, description: 'Validation failed' })
  // @ApiResponse({ status: 409, description: 'User already exists' })
  // async signupFirstStep(@Body() body: ISignupFirstStep) {
  //   return await this.authService.signupUserAndSendOtp({
  //     email: body.email.toLowerCase(),
  //   });
  // }

  @Post('/signup/final-step')
  @ApiOperation({
    summary: 'Signup Step 2: Verify OTP and create user',
    description: 'Verifies OTP and creates user with full submitted data.',
  })
  @ApiBody({
    description: 'Verify OTP and provide all required data',
    schema: {
      example: {
        sentOtp: '123456',
        email: 'test@example.com',
        phone: '+923001234567',
        password: 'StrongPassword123!',
        name: 'John Doe',
        user_type_id: '29cc763a-d7e5-4ab3-ad9e-92a81ff8b50a',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or missing data' })
  @ApiResponse({ status: 404, description: 'OTP not found or invalid' })
  async signupFinalStep(@Body() body: ISignupSecondStep) {
    return await this.authService.verifyOtpAndCreateUser(body);
  }

  @Post('/login/admin/email')
  @ApiOperation({
    summary: 'Admin login with email and password',
    description:
      'Allows Admin, Staff, and Vendor users to login with email and password',
  })
  @ApiBody({
    description: 'Admin login request body',
    schema: {
      example: {
        email: 'admin@example.com',
        password: 'password123'
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns auth token and user details.',
    schema: {
      example: {
        user: {
          id: 'user-id',
          email: 'admin@example.com',
          name: 'Admin User',
        },
        adminProfiles: [
          {
            key: 'Admin',
            data: {
              id: 'admin-id',
              type: 'admin',
            },
          },
        ],
        accessToken: 'jwt-token-here',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have admin privileges.',
  })
  async adminLoginWithEmail(
    @Req() request: Request,
    @Body() body: AdminLoginDto,
  ) {
    return this.authService.loginAdminWithEmail({
      email: body.email.toLowerCase(),
      password: body.password,
    });
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get authenticated admin profile',
    description: 'Returns the profile data for the logged-in admin using JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        id: 'user-id',
        email: 'admin@example.com',
        name: 'Admin User',
        phone: '+923001234567',
        block_status: false,
        type: 'admin',
        account_balance: 0,
        balance_in: 'PKR',
        email_is_verified: true,
        last_login: '2026-01-25T12:00:00Z',
        adminProfiles: [
          {
            key: 'admin',
            data: {
              id: 'admin-id',
              type: 'admin',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getProfile(@Req() request: any) {
    return this.authService.getAdminProfile(request.userId);
  }
}
