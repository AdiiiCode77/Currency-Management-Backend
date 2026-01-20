//reports module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellingEntryEntity } from '../sale-purchase/domain/entity/selling_entries.entity';
import { PurchaseEntryEntity } from '../sale-purchase/domain/entity/purchase_entries.entity';
import { RedisService } from '../../shared/modules/redis/redis.service';
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
import { CurrencyStockEntity } from '../currency/domain/entities/currency-stock.entity';
import { AddCurrencyEntity } from '../account/domain/entity/currency.entity';
import { JournalEntryEntity } from '../journal/domain/entity/journal-entry.entity';
import { BankPaymentEntryEntity } from '../journal/domain/entity/bank-payment-entry.entity';
import { BankReceiverEntryEntity } from '../journal/domain/entity/bank-receiver-entry.entity';
import { CashPaymentEntryEntity } from '../journal/domain/entity/cash-payment-entry.entity';
import { CashReceivedEntryEntity } from '../journal/domain/entity/cash-received-entry.entity';
import { AccountBalanceEntity } from '../journal/domain/entity/account-balance.entity';
import { AccountLedgerEntity } from '../journal/domain/entity/account-ledger.entity';
import { CustomerAccountEntity } from '../account/domain/entity/customer-account.entity';
import { BankAccountEntity } from '../account/domain/entity/bank-account.entity';
import { GeneralAccountEntity } from '../account/domain/entity/general-account.entity';

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
      CustomerEntity,
      CurrencyStockEntity,
      AddCurrencyEntity,
      JournalEntryEntity,
      BankPaymentEntryEntity,
      BankReceiverEntryEntity,
      CashPaymentEntryEntity,
      CashReceivedEntryEntity,
      AccountBalanceEntity,
      AccountLedgerEntity,
      CustomerAccountEntity,
      BankAccountEntity,
      GeneralAccountEntity,
    ]),
  ],
  controllers: [ReportController],
  providers: [RedisService, ReportService, JwtService, UserService],
  exports: [],
})
export class ReportsModule {}
