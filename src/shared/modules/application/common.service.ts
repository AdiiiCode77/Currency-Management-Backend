import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddChqRefBankEntity} from 'src/modules/account/domain/entity/add-chq-ref-bank.entity';
import { AddExpenseEntity } from 'src/modules/account/domain/entity/add-expense.entity';
import { BankAccountEntity } from 'src/modules/account/domain/entity/bank-account.entity';
import { CurrencyAccountEntity } from 'src/modules/account/domain/entity/currency-account.entity';
import { AddCurrencyEntity } from 'src/modules/account/domain/entity/currency.entity';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
import { EmployeeAccountEntity } from 'src/modules/account/domain/entity/employee-account.entity';
import { GeneralAccountEntity } from 'src/modules/account/domain/entity/general-account.entity';
import { CustomerCurrencyAccountEntity } from 'src/modules/currency/domain/entities/currencies-account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommonService {
  private repoMap: Record<string, Repository<any>>;
  constructor(
    @InjectRepository(CustomerAccountEntity)
    private customerRepo: Repository<CustomerAccountEntity>,
    @InjectRepository(BankAccountEntity)
    private bankRepo: Repository<BankAccountEntity>,
    @InjectRepository(GeneralAccountEntity)
    private generalRepo: Repository<GeneralAccountEntity>,
    @InjectRepository(EmployeeAccountEntity)
    private employee: Repository<EmployeeAccountEntity>,
    @InjectRepository(AddExpenseEntity)
    private expense: Repository<AddExpenseEntity>,
    @InjectRepository(AddChqRefBankEntity)
    private chqbank: Repository<AddChqRefBankEntity>,
    @InjectRepository(CurrencyAccountEntity)
    private currency: Repository<CurrencyAccountEntity>,
    @InjectRepository(AddCurrencyEntity)
    private currency_user: Repository<AddCurrencyEntity>,
    @InjectRepository(CustomerCurrencyAccountEntity)
    private currency_accounts: Repository<CustomerCurrencyAccountEntity>
    
    

  ) {
    this.repoMap = {
      customer: this.customerRepo,
      bank: this.bankRepo,
      general: this.generalRepo,
      employee: this.employee,
      expense: this.expense,
      chqbank: this.chqbank,
      currency: this.currency,
      currency_user: this.currency_user
    };
  }

  async getAllCustomersForDropdown(adminId: string) {
    try {
      const customers = await this.customerRepo.find({
        select: ['id', 'name'],
        order: { name: 'ASC' },
        where: { adminId },
      });

      return customers.map((c) => ({
        label: c.name,
        value: c.id,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to load customers. Please try again later.',
      );
    }
  }

  
  async getAllCurrencyAccountsForDropdown(adminId: string, currency_id: string) {
    try {
      const customers = await this.currency_accounts.find({
        select: ['id', 'name'],
        order: { name: 'ASC' },
        where: { adminId, currencyId: currency_id },
      });

      return customers.map((c) => ({
        label: c.name,
        value: c.id,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to load customers. Please try again later.',
      );
    }
  }

  async getAllBankForDropdown(adminId: string) {
    try {
      const banks = await this.bankRepo.find({
        select: ['id', 'bankName', 'accountNumber'],
        order: { bankName: 'ASC' },
        where: { adminId },
      });
      return banks.map((b) => ({
        label: b.bankName,
        value: b.id,
        accountNumber: b.accountNumber,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to load banks. Please try again later.',
      );
    }
  }

  async getModuleById(module: string, id: string) {
    const repo = this.repoMap[module];

    if (!repo) {
      throw new BadRequestException('Invalid module name');
    }

    const record = await repo.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(
        `Record not found for ${module} with id ${id}`,
      );
    }

    return record;
  }

  async getCurrencyofUser(adminId: string){
    try {
      const customers = await this.currency_user.find({
        select: ['id', 'name', 'code'],
        order: { name: 'ASC' },
        where: { adminId },
      });

      return customers.map((c) => ({
        label: c.name,
        value: c.id,
        code: c.code
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to load customers. Please try again later.',
      );
    }
  }

  async getRefBanks(adminId: string){
    const refbanks = await this.chqbank.find({
      where: {adminId: adminId},
      order: {name : 'ASC'},
      select: ['name', 'id']
    });

    return refbanks.map((c) => ({
      label: c.name,
      value: c.id,
    }));
  }
}
