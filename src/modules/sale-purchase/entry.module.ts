import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SalePurchaseService } from './application/entry.service';


import { CurrencyAccountEntity } from 'src/modules/account/domain/entity/currency-account.entity';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
import { PurchaseEntryEntity } from './domain/entity/purchase_entries.entity';
import { SellingEntryEntity } from './domain/entity/selling_entries.entity';
import { SalePurchaseController } from './interface/entry.controller';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/application/user.service';
import { UserEntity } from '../users/domain/entities/user.entity';
import { UserProfileEntity } from '../users/domain/entities/user-profiles.entity';
import { UserTypeEntity } from '../users/domain/entities/user-type.entity';
import { AdminEntity } from '../users/domain/entities/admin.entity';
import { CustomerEntity } from '../users/domain/entities/customer.entity';
import { CurrencyRelationEntity } from './domain/entity/currencyRelation.entity';
import { AddCurrencyEntity } from '../account/domain/entity/currency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseEntryEntity,
      SellingEntryEntity,
      CurrencyAccountEntity,
      CustomerAccountEntity,
      UserEntity,
      UserProfileEntity,
      UserTypeEntity,
      AdminEntity,
      CustomerEntity,
      CurrencyRelationEntity,
      AddCurrencyEntity,
    ]),
  ],
  controllers: [SalePurchaseController],
  providers: [SalePurchaseService, JwtService, UserService],
  exports: [SalePurchaseService], 
})
export class SalePurchaseModule {}
