import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity } from './domain/entities/otp.entity';
import { MailModule } from 'src/shared/modules/mail/mail.module';
import { MailService } from 'src/shared/modules/mail/mail.service';
import { UserEntity } from '../users/domain/entities/user.entity';
import { OtpService } from './application/otp.service';
import { OtpController } from './interfaces/otp.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([OtpEntity, UserEntity]),
    MailModule,
  ],
  providers: [OtpService, MailService],
  controllers: [OtpController],
})
export class OtpModule {}
