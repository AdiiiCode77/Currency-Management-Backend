import {
  Body,
  Controller,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../application/user.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { UserProfileDTO } from '../domain/dto/profile.dto';
import { ChangePasswordDTO } from '../domain/dto/password.dto';
import {
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MailService } from 'src/shared/modules/mail/mail.service';
import type { Request } from 'express';

@ApiTags('Users')
@Controller('/api/v1/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailService,
  ) {}

  @Patch('/')
  @ApiOperation({
    summary: 'Update Profile Details',
    description: 'To Update generic profile details across all user types',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody({
    description: 'Update user profile (all fields optional)',
    required: false,

    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Huzaifa',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'huzaifa@example.com',
        },
        phone: {
          type: 'string',
          example: '+923227385813',
        }
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched user data',
    schema: {
      example: {
        user: {
          id: '2a91807f-badc-47e6-befb-82a200e97e64',
          email: 'huzmanbutt@gmail.com',
          phone: '+923227385813',
          password:
            '$2b$10$MKOSLHviXUwL3EbQW/n9wO7Xgt3cM28LlNvVjjEosaWVmHIrlwaNe',
          name: 'huzaifa',
          email_is_verified: false,
          phone_is_verified: false,
          fcm_token: 'dummy',
          profile: 'https://cdn-icons-png.flaticon.com/512/8847/8847419.png',
          google_id: null,
          apple_id: null,
          createdAt: '2025-08-15T09:07:49.113Z',
          updatedAt: '2025-08-19T07:53:32.170Z',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profile'))
  updateUserProfile(
    @Req() req: Request,
    @Body() body: UserProfileDTO,
  ) {
    return this.userService.updateProfile({
      userId: req.userId,
      ...body,
    });
  }

  @Patch('/password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        previous_password: {
          type: 'string',
          example: 'oldPassword123',
        },
        new_password: {
          type: 'string',
          example: 'newPassword456',
        },
      },
      required: ['previous_password', 'new_password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Incorrect password or validation error',
  })
  updateUserPassword(@Req() req: Express.Request, @Body() body: ChangePasswordDTO) {
    return this.userService.changePassword({ userId: req.userId, ...body });
  }

}
