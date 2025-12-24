//reports module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellingEntryEntity } from 'src/modules/sale-purchase/domain/entity/selling_entries.entity';
import { PurchaseEntryEntity } from 'src/modules/sale-purchase/domain/entity/purchase_entries.entity';
import { RedisService } from 'src/shared/modules/redis/redis.service';
import { ReportController } from './interface/report.controller';
import { ReportService } from './application/report.service';
import { CustomerCurrencyEntryEntity } from '../currency/domain/entities/currency-entry.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/application/user.service';
import { UserEntity } from '../users/domain/entities/user.entity';
import { UserProfileEntity } from '../users/domain/entities/user-profiles.entity';
import { UserTypeEntity } from '../users/domain/entities/user-type.entity';
import { AdminEntity } from '../users/domain/entities/admin.entity';
import { CustomerEntity } from '../users/domain/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SellingEntryEntity,
      PurchaseEntryEntity,
      CustomerCurrencyEntryEntity,
      UserEntity,
      UserProfileEntity,
      UserTypeEntity,
      AdminEntity,
      CustomerEntity
    ]),
  ],
  controllers: [ReportController],
  providers: [RedisService, ReportService, JwtService, UserService],
  exports: [],
})
export class ReportsModule {}
