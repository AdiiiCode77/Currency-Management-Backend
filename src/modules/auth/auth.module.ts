//auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/domain/entities/user.entity';
import { UserTypeEntity } from '../users/domain/entities/user-type.entity';
import { CustomerEntity } from '../users/domain/entities/customer.entity';
import { JwtService } from '@nestjs/jwt';
import { UserProfileEntity } from '../users/domain/entities/user-profiles.entity';
import { AuthController } from './interface/auth.controller';
import { AuthService } from './application/auth.service';
// import { MailModule } from 'src/shared/modules/mail/mail.module';
import { OtpSignupEntity } from '../otp/domain/entities/otp-signup.entity';
import { OtpEntity } from '../otp/domain/entities/otp.entity';
import { UserModule } from '../users/user.module';
import { AdminEntity } from '../users/domain/entities/admin.entity';
@Module({
  imports: [
    // MailModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserTypeEntity,
      UserProfileEntity,
      CustomerEntity,
      OtpSignupEntity,
      OtpEntity,
      OtpSignupEntity,
      AdminEntity
    ]),
    UserModule,
  ],
  providers: [
    AuthService,
    JwtService,
    OtpSignupEntity,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
