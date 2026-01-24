//auth.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../users/domain/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidV4 } from 'uuid';
import { UserTypeEntity } from '../../users/domain/entities/user-type.entity';
import { AdminEntity } from '../../users/domain/entities/admin.entity';
import AppDataSource from '../../../../data-source';
import { UserProfileEntity } from '../../users/domain/entities/user-profiles.entity';
import {
  ISignupFirstStep,
  ISignupSecondStep,
} from '../domain/types/auth-types';
// import { MailService } from 'src/shared/modules/mail/mail.service';
// import { generateOtp } from 'src/shared/helpers/generateOTP';
import { OtpSignupEntity } from '../../otp/domain/entities/otp-signup.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserTypeEntity)
    private userTypeEntity: Repository<UserTypeEntity>,
    @InjectRepository(UserProfileEntity)
    private userProfileEntity: Repository<UserProfileEntity>,
    @InjectRepository(AdminEntity) private adminEntity: Repository<AdminEntity>,
    @InjectDataSource(AppDataSource)
    private readonly dataSource: typeof AppDataSource,
    // private readonly mailService: MailService,
    @InjectRepository(OtpSignupEntity)
    private otpSignupEntity: Repository<OtpSignupEntity>,
  ) {}

  async checkPhoneExistence(phone: string) {
    const user = await this.userRepository.findOne({
      where: {
        phone: phone,
      },
    });

    if (user) {
      return { exists: true };
    }

    return { exists: false };
  }

  // async signupUserAndSendOtp(
  //   body: ISignupFirstStep
  // ) {
  //   const email = body.email.toLowerCase();

  //   // Check for existing email
  //   const existingUserEmail = await this.userRepository.findOne({
  //     where: { email },
  //   });

  //   if (existingUserEmail) {
  //     throw new ConflictException(['An account with this email already exists. Please use a different email or try logging in.']);
  //   }

  //   if (!email) {
  //     throw new BadRequestException(['Email is required to send OTP']);
  //   }
  //   const otp = generateOtp();
  //   await this.otpSignupEntity.delete({ email });

  //   // 6. Save new OTP
  //   await this.otpSignupEntity.save({
  //     id: uuidV4(),
  //     email,
  //     code: otp,
  //   });

  //   try {
  //     await this.mailService.sendOtpEmail(email,'User', otp);
  //   } catch (error) {
  //     throw new BadRequestException(['Failed to send OTP email']);
  //   }

  //   return {
  //     message: 'OTP sent to email address',
  //     redirectTo: 'otp-verification',
  //     email,
  //   };
  // }

  async verifyOtpAndCreateUser(body: ISignupSecondStep) {
    const email = body.email.toLowerCase();

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedOtp = await queryRunner.manager
        .getRepository(OtpSignupEntity)
        .findOneBy({ email });

      if (!savedOtp) {
        throw new NotFoundException([
          'OTP has expired or not found. Please request a new verification code.',
        ]);
      }

      if (savedOtp.code !== body.sentOtp) {
        throw new BadRequestException(['The verification code you entered is incorrect. Please check and try again.']);
      }

      const userType = await queryRunner.manager
        .getRepository(UserTypeEntity)
        .findOneBy({ id: body.user_type_id });
      if (!userType) {
        throw new NotFoundException(['Invalid user role. Please contact support for assistance.']);
      }
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException(['An account with this email already exists. Please try logging in instead.']);
      }

      const existingphone = await this.userRepository.findOne({
        where: { phone: body.phone },
      })
      
      if (existingphone) {
        throw new ConflictException(['This phone number is already registered. Please use a different number or try logging in.']);
      }
      const tempData = await this.otpSignupEntity.findOneBy({ email });

      if (!tempData) {
        throw new NotFoundException([
          'Your signup session has expired. Please start the registration process again.',
        ]);
      }

      const userId = uuidV4();
      const mainTableId = uuidV4();

      const hashPassword = await bcrypt.hash(body.password, 10);

      const user = await queryRunner.manager.getRepository(UserEntity).save({
        id: userId,
        email,
        name: body.name,
        password: hashPassword,
        phone: body.phone,
        email_is_verified: true,
      });

      const profileTypeData = await queryRunner.manager
        .getRepository(UserProfileEntity)
        .save({
          user_id: user.id,
          user_type_id: userType.id,
        });

      switch (userType.name) {
        case 'customer':
          await queryRunner.manager.getRepository(UserEntity).save({
            id: mainTableId,
            user_profile_id: profileTypeData.id,
            loyaltyPoints: 0,
            preferences: {},
          });
          break;

        case 'admin':
          await queryRunner.manager.getRepository(AdminEntity).save({
            id: mainTableId,
            user_profile_id: profileTypeData.id,
            type: 'admin',
          });
          break;

        default:
          throw new BadRequestException([
            `Unsupported user type: ${userType.name}`,
          ]);
      }

      await queryRunner.commitTransaction();

      await this.otpSignupEntity.delete({ email });

      const accessToken = this.jwtService.sign(
        { id: user.id },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '30d',
        },
      );

      await this.userRepository.update(
        { id: user.id },
        { last_login: new Date() },
      );

      return {
        message: 'Signup completed successfully',
        user,
        profileTypeData,
        accessToken,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Unable to complete signup. Please try again later or contact support if the issue persists.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async loginAdminWithEmail(body: {
    email: string;
    password: string
  }) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email.toLowerCase(),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password. Please check your credentials and try again.');
    }

    // Check if admin is blocked
    if (user.block_status === true) {
      throw new ForbiddenException('Your account has been blocked. Please contact support for assistance.');
    }

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid email or password. Please check your credentials and try again.');
    }

    // Check if user has admin, staff, or vendor profile
    const adminProfiles = await this.userProfileEntity
      .createQueryBuilder('user_profile')
      .leftJoinAndSelect('user_profile.userType', 'user_types')
      .where('user_profile.user_id = :userId', { userId: user.id })
      .andWhere('user_types.name IN (:...types)', {
        types: ['admin', 'customer', 'superAdmin'],
      })
      .getMany();

    if (adminProfiles.length === 0) {
      throw new ForbiddenException(
        'Access denied. This account does not have administrative privileges.',
      );
    }
    const mainTablesData: ({ data: AdminEntity } & { key: string })[] = [];

    for (const profile of adminProfiles) {
      const adminData = await this.adminEntity.findOneBy({
        user_profile_id: profile.id,
      });

      if (adminData) {
        mainTablesData.push({
          key: profile.userType.name,
          data: adminData,
        });
      }
    }

    const accessToken = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '30d',
      },
    );

    await this.userRepository.update(
      { id: user.id },
      { last_login: new Date() },
    );
    return {
      user,
      adminProfiles: mainTablesData,
      accessToken,
    };
  }

  // Get Admin Profile by User ID (from JWT token)
  async getAdminProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if admin is blocked
    if (user.block_status === true) {
      throw new ForbiddenException('Your account has been blocked. Please contact support for assistance.');
    }

    // Get admin profiles
    const adminProfiles = await this.userProfileEntity
      .createQueryBuilder('user_profile')
      .leftJoinAndSelect('user_profile.userType', 'user_types')
      .where('user_profile.user_id = :userId', { userId: user.id })
      .andWhere('user_types.name IN (:...types)', {
        types: ['admin', 'customer', 'superAdmin'],
      })
      .getMany();

    if (adminProfiles.length === 0) {
      throw new ForbiddenException(
        'Access denied. This account does not have administrative privileges.',
      );
    }

    const mainTablesData: ({ data: AdminEntity } & { key: string })[] = [];

    for (const profile of adminProfiles) {
      const adminData = await this.adminEntity.findOneBy({
        user_profile_id: profile.id,
      });

      if (adminData) {
        mainTablesData.push({
          key: profile.userType.name,
          data: adminData,
        });
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      block_status: user.block_status,
      account_balance: user.account_balance,
      balance_in: user.balance_in,
      email_is_verified: user.email_is_verified,
      last_login: user.last_login,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      adminProfiles: mainTablesData,
    };
  }
}
