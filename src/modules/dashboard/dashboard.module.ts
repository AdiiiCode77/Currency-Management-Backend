import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChqInwardEntryEntity } from './domain/entity/chq-inward-entry.entity';
import { DashboardService } from './application/dashboard.service';
import { DashboardController } from './interface/dashboard.controller';
import { CustomerAccountEntity } from '../account/domain/entity/customer-account.entity';
import { AddChqRefBankEntity } from '../account/domain/entity/add-chq-ref-bank.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/application/user.service';
import { UserEntity } from '../users/domain/entities/user.entity';
import { UserProfileEntity } from '../users/domain/entities/user-profiles.entity';
import { UserTypeEntity } from '../users/domain/entities/user-type.entity';
import { AdminEntity } from '../users/domain/entities/admin.entity';
import { CustomerEntity } from '../users/domain/entities/customer.entity';
import { ChqOutwardEntryEntity } from './domain/entity/chq-outward-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChqInwardEntryEntity,
      CustomerAccountEntity,
      AddChqRefBankEntity,
      UserEntity,
      UserProfileEntity,
      UserTypeEntity,
      AdminEntity,
      CustomerEntity,
      ChqOutwardEntryEntity
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, JwtService, UserService],
})
export class DashboardModule {}
