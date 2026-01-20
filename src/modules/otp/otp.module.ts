import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity } from './domain/entities/otp.entity';
import { UserEntity } from '../users/domain/entities/user.entity';
import { OtpService } from './application/otp.service';
import { OtpController } from './interfaces/otp.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([OtpEntity, UserEntity]),
  ],
  providers: [OtpService],
  controllers: [OtpController],
})
export class OtpModule {}
