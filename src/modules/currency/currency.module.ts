import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyAccountController } from './interface/currency.controller';
import { CurrencyAccountService } from './application/currency.service';
import { UserService } from '../users/application/user.service';
import { JwtService } from '@nestjs/jwt';
import { CustomerCurrencyAccountEntity } from './domain/entities/currencies-account.entity';
import { UserEntity } from '../users/domain/entities/user.entity';
import { UserProfileEntity } from '../users/domain/entities/user-profiles.entity';
import { UserTypeEntity } from '../users/domain/entities/user-type.entity';
import { AdminEntity } from '../users/domain/entities/admin.entity';
import { CustomerEntity } from '../users/domain/entities/customer.entity';
import { CustomerCurrencyEntryEntity } from './domain/entities/currency-entry.entity';
import { AddCurrencyEntity } from '../account/domain/entity/currency.entity';
import { RedisService } from 'src/shared/modules/redis/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerCurrencyAccountEntity,
      UserEntity,
      UserProfileEntity,
      UserTypeEntity,
      AdminEntity,
      CustomerEntity,
      CustomerCurrencyEntryEntity,
      AddCurrencyEntity
    ]),
  ],
  controllers: [CurrencyAccountController],
  providers: [CurrencyAccountService, UserService, JwtService, RedisService],
  exports: [CurrencyAccountService],
})
export class CurrencyModule {}
