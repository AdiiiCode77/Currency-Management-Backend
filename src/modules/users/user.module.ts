import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './interface/user.controller';
import { UserEntity } from './domain/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from './domain/entities/admin.entity';
import { CustomerEntity } from './domain/entities/customer.entity';
import { JwtService } from '@nestjs/jwt';
import { UserProfileEntity } from './domain/entities/user-profiles.entity';
import { UserTypeEntity } from './domain/entities/user-type.entity';
import { MailService } from 'src/shared/modules/mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
      UserTypeEntity,
      AdminEntity,
      CustomerEntity,
    ]),
  ],
  providers: [
    UserService,
    JwtService,
    MailService,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
