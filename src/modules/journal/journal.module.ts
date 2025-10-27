import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntryEntity } from './domain/entity/journal-entry.entity';
import { CustomerEntity } from '../users/domain/entities/customer.entity';
import { JournalService } from './application/jounal.service';
import { JournalController } from './interface/journal.controller';
import { JournalGetController } from './interface/journal-get.controller';
import { CreateCashPaymentEntryDto } from './domain/dto/create-cash-payment-entry.dto';
import { CreateCashReceivedEntryDto } from './domain/dto/create-cash-received-entry.dto';
import { CreateBankPaymentEntryDto } from './domain/dto/create-bank-payment-entry.dto';
import { CreateBankReceiverEntryDto } from './domain/dto/reate-bank-receiver-entry.dto';
import { CreateJournalEntryDto } from './domain/dto/create-journal-entry.dto';
import { CashPaymentEntryEntity } from './domain/entity/cash-payment-entry.entity';
import { CashReceivedEntryEntity } from './domain/entity/cash-received-entry.entity';
import { BankPaymentEntryEntity } from './domain/entity/bank-payment-entry.entity';
import { BankReceiverEntryEntity } from './domain/entity/bank-receiver-entry.entity';
import { CustomerAccountEntity } from '../account/domain/entity/customer-account.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/application/user.service';
import { UserEntity } from '../users/domain/entities/user.entity';
import { UserProfileEntity } from '../users/domain/entities/user-profiles.entity';
import { UserTypeEntity } from '../users/domain/entities/user-type.entity';
import { AdminEntity } from '../users/domain/entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JournalEntryEntity,
      CustomerEntity,
      CashPaymentEntryEntity,
      CashReceivedEntryEntity,
      BankPaymentEntryEntity,
      BankReceiverEntryEntity,
      CustomerAccountEntity,
      UserEntity,
      UserProfileEntity,
      UserTypeEntity,
      AdminEntity,
    ]),
  ],
  providers: [JournalService, JwtService, UserService],
  controllers: [JournalController, JournalGetController],
})
export class JournalModule {}
