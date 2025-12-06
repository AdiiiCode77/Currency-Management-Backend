import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerAccountEntity } from '../domain/entity/customer-account.entity';
import { BankAccountEntity } from '../domain/entity/bank-account.entity';
import { GeneralAccountEntity } from '../domain/entity/general-account.entity';
import { EmployeeAccountEntity } from '../domain/entity/employee-account.entity';
import { AddExpenseEntity } from '../domain/entity/add-expense.entity';
import { AddChqRefBankEntity } from '../domain/entity/add-chq-ref-bank.entity';
import { AddCurrencyEntity } from '../domain/entity/currency.entity';
import { CurrencyAccountEntity } from '../domain/entity/currency-account.entity';
import { UUID } from 'crypto';

@Injectable()
export class UpdateAccountsService {
  constructor(
    @InjectRepository(CustomerAccountEntity)
    private readonly customerRepo: Repository<CustomerAccountEntity>,
    @InjectRepository(BankAccountEntity)
    private readonly bankRepo: Repository<BankAccountEntity>,
    @InjectRepository(GeneralAccountEntity)
    private readonly generalRepo: Repository<GeneralAccountEntity>,
    @InjectRepository(EmployeeAccountEntity)
    private readonly employeeRepo: Repository<EmployeeAccountEntity>,
    @InjectRepository(AddExpenseEntity)
    private readonly expenseRepo: Repository<AddExpenseEntity>,
    @InjectRepository(AddChqRefBankEntity)
    private readonly chqRefBankRepo: Repository<AddChqRefBankEntity>,
    @InjectRepository(AddCurrencyEntity)
    private readonly currencyRepo: Repository<AddCurrencyEntity>,
    @InjectRepository(CurrencyAccountEntity)
    private readonly currencyAccountRepo: Repository<CurrencyAccountEntity>,
  ) {}

  // Generic update handler
  private async updateEntity<T>(
    repo: Repository<T>,
    id: string,
    partialData: Partial<T>,
  ): Promise<T> {
    const entity = await repo.findOne({ where: { id } as any });
    if (!entity) throw new NotFoundException('Record not found');

    Object.assign(entity, partialData);
    return await repo.save(entity);
  }

  async updateCustomerAccount(id: string, dto: Partial<CustomerAccountEntity>) {
    return this.updateEntity(this.customerRepo, id, dto);
  }

  async updateBankAccount(id: string, dto: Partial<BankAccountEntity>) {
    return this.updateEntity(this.bankRepo, id, dto);
  }

  async updateGeneralAccount(id: string, dto: Partial<GeneralAccountEntity>) {
    return this.updateEntity(this.generalRepo, id, dto);
  }

  async updateEmployeeAccount(id: string, dto: Partial<EmployeeAccountEntity>) {
    return this.updateEntity(this.employeeRepo, id, dto);
  }

  async updateExpense(id: string, dto: Partial<AddExpenseEntity>) {
    return this.updateEntity(this.expenseRepo, id, dto);
  }

  async updateChqRefBank(id: string, dto: Partial<AddChqRefBankEntity>) {
    return this.updateEntity(this.chqRefBankRepo, id, dto);
  }

  async updateCurrency(id: string, dto: Partial<AddCurrencyEntity>) {
    return this.updateEntity(this.currencyRepo, id, dto);
  }

  async updateCurrencyAccount(id: string, dto: Partial<CurrencyAccountEntity>) {
    return this.updateEntity(this.currencyAccountRepo, id, dto);
  }
}
