import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SuperAdminController } from './interface/super-admin.controller';
import { SuperAdminService } from './application/super-admin.service';
import { SuperAdminEntity } from './domain/entities/super-admin.entity';
import { AdminPaymentEntity } from './domain/entities/admin-payment.entity';
import { UserEntity } from '../users/domain/entities/user.entity';
import { UserProfileEntity } from '../users/domain/entities/user-profiles.entity';
import { AdminEntity } from '../users/domain/entities/admin.entity';
import { UserTypeEntity } from '../users/domain/entities/user-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SuperAdminEntity,
      AdminPaymentEntity,
      UserEntity,
      UserProfileEntity,
      AdminEntity,
      UserTypeEntity,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
