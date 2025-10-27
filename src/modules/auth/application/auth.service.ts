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
import { adminTypes } from 'src/shared/enums/admin.enum';
import {
  ISignupFirstStep,
  ISignupSecondStep,
} from '../domain/types/auth-types';
import { MailService } from 'src/shared/modules/mail/mail.service';
import { generateOtp } from 'src/shared/helpers/generateOTP';
import { OtpSignupEntity } from 'src/modules/otp/domain/entities/otp-signup.entity';
import { OtpEntity } from 'src/modules/otp/domain/entities/otp.entity';
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
    private readonly mailService: MailService,
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

  async signupUserAndSendOtp(
    body: ISignupFirstStep
  ) {
    const email = body.email.toLowerCase();

    // Check for existing email
    const existingUserEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUserEmail) {
      throw new ConflictException(['User already exists with this email']);
    }

    if (!email) {
      throw new BadRequestException(['Email is required to send OTP']);
    }
    const otp = generateOtp();
    await this.otpSignupEntity.delete({ email });

    // 6. Save new OTP
    await this.otpSignupEntity.save({
      id: uuidV4(),
      email,
      code: otp,
    });

    try {
      await this.mailService.sendOtpEmail(email,'User', otp);
    } catch (error) {
      throw new BadRequestException(['Failed to send OTP email']);
    }

    return {
      message: 'OTP sent to email address',
      redirectTo: 'otp-verification',
      email,
    };
  }

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
          'No OTP found for this email. Please request a new one.',
        ]);
      }

      if (savedOtp.code !== body.sentOtp) {
        throw new BadRequestException(['Incorrect OTP']);
      }

      const userType = await queryRunner.manager
        .getRepository(UserTypeEntity)
        .findOneBy({ id: body.user_type_id });
      if (!userType) {
        throw new NotFoundException(['User Type/Role not found']);
      }
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException(['User already exists with this email']);
      }

      const existingphone = await this.userRepository.findOne({
        where: { phone: body.phone },
      })
      
      if(existingphone){
        throw new ConflictException(['User already exists with this phone number']);
      }
      const tempData = await this.otpSignupEntity.findOneBy({ email });

      if (!tempData) {
        throw new NotFoundException([
          'Signup data not found. Please restart process.',
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

      throw new InternalServerErrorException({
        message: [err?.message || 'Something went wrong'],
        error: 'Internal Server Error',
        code: 500,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async loginAdminWithEmail(body: {
    email: string;
    password: string;
    device_push_token?: string;
  }) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email.toLowerCase(),
      },
    });

    if (!user) {
      throw new NotFoundException(['User with this email doesnt exists']);
    }

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      throw new BadRequestException(['Password not match']);
    }

    // Check if user has admin, staff, or vendor profile
    const adminProfiles = await this.userProfileEntity
      .createQueryBuilder('user_profile')
      .leftJoinAndSelect('user_profile.userType', 'user_types')
      .where('user_profile.user_id = :userId', { userId: user.id })
      .andWhere('user_types.name IN (:...types)', {
        types: ['admin', 'User', 'superAdmin'],
      })
      .getMany();

    if (adminProfiles.length === 0) {
      throw new ForbiddenException([
        'This account does not have admin privileges',
      ]);
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
}
