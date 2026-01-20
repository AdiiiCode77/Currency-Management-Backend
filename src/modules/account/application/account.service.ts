import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerAccountEntity } from '../domain/entity/customer-account.entity';
import { Repository } from 'typeorm';
import { CreateCustomerAccountDto } from '../domain/dto/create-customer-account.dto';
import { CreateBankAccountDto } from '../domain/dto/create-bank-account.dto';
import { BankAccountEntity } from '../domain/entity/bank-account.entity';
import { GeneralAccountEntity } from '../domain/entity/general-account.entity';
import { CreateGeneralAccountDto } from '../domain/dto/create-general-account.dto';
import { EmployeeAccountEntity } from '../domain/entity/employee-account.entity';
import { CreateEmployeeAccountDto } from '../domain/dto/create-employee-account.dto';
import { PaginationDto } from '../../../shared/modules/dtos/pagination.dto';
import { buildPaginationResponse } from '../../../shared/utils/pagination.utils';
import { CreateAddExpenseDto } from '../domain/dto/create-add-expense.dto';
import { AddExpenseEntity } from '../domain/entity/add-expense.entity';
import { CreateAddChqRefBankDto } from '../domain/dto/create-add-chq-ref-bank.dto';
import { AddChqRefBankEntity } from '../domain/entity/add-chq-ref-bank.entity';
import { CreateAddCurrencyDto } from '../domain/dto/create-add-currency.dto';
import { AddCurrencyEntity } from '../domain/entity/currency.entity';
import { CreateCurrencyAccountDto } from '../domain/dto/create-currency-account.dto';
import { CurrencyAccountEntity } from '../domain/entity/currency-account.entity';
import { RedisService } from '../../../shared/modules/redis/redis.service';

@Injectable()
export default class AccountService {
  constructor(
    @InjectRepository(CustomerAccountEntity)
    private readonly customerAccountRepository: Repository<CustomerAccountEntity>,
    @InjectRepository(BankAccountEntity)
    private readonly bankRepo: Repository<BankAccountEntity>,
    @InjectRepository(GeneralAccountEntity)
    private readonly generalAccountRepo: Repository<GeneralAccountEntity>,
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

    private readonly redisService: RedisService,
  ) {}

  async addUserAccount(dto: CreateCustomerAccountDto, adminId: string) {
    const newAccount = this.customerAccountRepository.create({
      ...dto,
      adminId,
    });
    const redis = this.redisService.getClient();
    
      await redis.del(`customers_${adminId}*`);
    return await this.customerAccountRepository.save(newAccount);


  }

  async findAllUserAccount(adminId: string, paginationDto: PaginationDto) {
    const { offset, limit } = paginationDto;

    const [data, total] = await this.customerAccountRepository.findAndCount({
      where: { adminId },
      skip: (offset - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    return buildPaginationResponse(data, total, offset, limit);
  }

  async addBankAccount(dto: CreateBankAccountDto, adminId: string,): Promise<BankAccountEntity> {
    const newAccount = this.bankRepo.create({
      ...dto,
      adminId,
    });
    return await this.bankRepo.save(newAccount);
  }

  async findAllBankAccount(adminId: string, paginationDto: PaginationDto) {
    const { offset, limit } = paginationDto;
    const [data, total] = await this.bankRepo.findAndCount({
      where: { adminId },
      skip: (offset - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    return buildPaginationResponse(data, total, offset, limit);
  }

  async addGeneralAccount(dto: CreateGeneralAccountDto, adminId: string,): Promise<GeneralAccountEntity> {
    const newAccount = this.generalAccountRepo.create({
      ...dto,
      adminId,
    });
    return await this.generalAccountRepo.save(newAccount);
  }

  async getAllGeneralAccounts(adminId: string, paginationDto: PaginationDto) {
    const { offset, limit } = paginationDto;

    const [data, total] = await this.generalAccountRepo.findAndCount({
      where: { adminId },
      skip: (offset - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return buildPaginationResponse(data, total, offset, limit);
  }

  async addExpense(dto: CreateAddExpenseDto, adminId: string,): Promise<AddExpenseEntity> {
    const expense = this.expenseRepo.create({
      ...dto,
      adminId,
    });
    return await this.expenseRepo.save(expense);
  }

  async getAllExpenses(adminId: string, paginationDto: PaginationDto) {
    const { offset, limit } = paginationDto;

    const [data, total] = await this.expenseRepo.findAndCount({
      where: { adminId },
      skip: (offset - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return buildPaginationResponse(data, total, offset, limit);
  }

  async addChqRefBank(dto: CreateAddChqRefBankDto, adminId: string,): Promise<AddChqRefBankEntity> {
    const bank = this.chqRefBankRepo.create({
      ...dto,
      adminId,
    });
    return await this.chqRefBankRepo.save(bank);
  }

  async getAllChqRefBank(adminId: string, paginationDto: PaginationDto) {
    const { offset, limit } = paginationDto;

    const [data, total] = await this.chqRefBankRepo.findAndCount({
      where: { adminId },
      skip: (offset - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return buildPaginationResponse(data, total, offset, limit);
  }

  async addEmplyeeAccount(dto: CreateEmployeeAccountDto, adminId: string,): Promise<EmployeeAccountEntity> {
    const employee = this.employeeRepo.create({
      ...dto,
      adminId,
    });
    return await this.employeeRepo.save(employee);
  }

  async getallEmplyeeAccount(adminId: string, paginationDto: PaginationDto) {
    const { offset, limit } = paginationDto;

    const [data, total] = await this.employeeRepo.findAndCount({
      where: { adminId },
      skip: (offset - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return buildPaginationResponse(data, total, offset, limit);
  }

  async addCurrency(dto: CreateAddCurrencyDto, adminId: string,): Promise<AddCurrencyEntity> {
    const currency = this.currencyRepo.create({
      ...dto,
      adminId,
    });
    return await this.currencyRepo.save(currency);
  }

  async getAllCurrencies(adminId: string, paginationDto: PaginationDto) {
    const { offset, limit } = paginationDto;

    const [data, total] = await this.currencyRepo.findAndCount({
      where: { adminId },
      skip: (offset - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return buildPaginationResponse(data, total, offset, limit);
  }

  async getAllCurrencieswithoutPagination(adminId: string) {
    return await this.currencyRepo.find({
      select: ['id', 'name'],
      where:{adminId: adminId},
      order: { name: 'ASC' },
    });
  }

  async createCurrencyAccount(dto: CreateCurrencyAccountDto, adminId: string) {
    const currency = await this.currencyRepo.findOne({
      where: { id: dto.currencyId }
    });
    if (!currency) {
      throw new Error('Currency not found.');
    }
    const account = this.currencyAccountRepo.create({
      ...dto,
      adminId
    });
    return await this.currencyAccountRepo.save(account);
  }

  async getAllCurrencyAccounts(adminId: string, paginationDto: PaginationDto) {
    const { offset, limit } = paginationDto;

    const [data, total] = await this.currencyAccountRepo.findAndCount({
      where: { adminId },
      relations: ['currency'],
      skip: (offset - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return buildPaginationResponse(data, total, offset, limit);
  }
}
