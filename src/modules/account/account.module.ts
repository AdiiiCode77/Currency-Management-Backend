//auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/shared/modules/mail/mail.module';
import { UserModule } from '../users/user.module';
import AccountService from './application/account.service';
import { AccountController } from './interface/account.controller';
import { BankAccountEntity } from './domain/entity/bank-account.entity';
import { CustomerEntity } from '../users/domain/entities/customer.entity';
import { EmployeeAccountEntity } from './domain/entity/employee-account.entity';
import { GeneralAccountEntity } from './domain/entity/general-account.entity';
import { CustomerAccountEntity } from './domain/entity/customer-account.entity';
import { JwtService } from '@nestjs/jwt';
import { UpdateAccountsService } from './application/update-accounts.service';
import { UpdateAccountsController } from './interface/update-accounts.controller';
import { AddChqRefBankEntity } from './domain/entity/add-chq-ref-bank.entity';
import { AddCurrencyEntity } from './domain/entity/currency.entity';
import { AddExpenseEntity } from './domain/entity/add-expense.entity';
import { CurrencyAccountEntity } from './domain/entity/currency-account.entity';
import { AccountGetController } from './interface/account-get.controller';
@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([
      BankAccountEntity,
      CustomerEntity,
      EmployeeAccountEntity,
      GeneralAccountEntity,
      CustomerAccountEntity,
      AddChqRefBankEntity,
      AddCurrencyEntity,
      AddExpenseEntity,
      CurrencyAccountEntity
    ]),
    UserModule,
  ],
  providers: [
    AccountService, JwtService, UpdateAccountsService
  ],
  controllers: [AccountController, UpdateAccountsController, AccountGetController],
})
export class AccountsModule {}
