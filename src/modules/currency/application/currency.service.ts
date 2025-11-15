import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerCurrencyAccountEntity } from '../domain/entities/currencies-account.entity';
import { CustomerCreateCurrencyAccountDto } from '../domain/dto/create-currency-account.dto';
import { buildPaginationResponse } from 'src/shared/utils/pagination.utils';
import { PaginationDto } from 'src/shared/modules/dtos/pagination.dto';
import { UpdateCustomerCurrencyAccountDto } from '../domain/dto/update-currency-accounts.dto';
import {
  CreateCurrencyEntryDto,
  EntryType,
} from '../domain/dto/create-currency-entry.dto';
import { CustomerCurrencyEntryEntity } from '../domain/entities/currency-entry.entity';
import { CreateMultipleCurrencyEntryDto } from '../domain/dto/multiple-currency-entry.dto';

@Injectable()
export class CurrencyAccountService {
  constructor(
    @InjectRepository(CustomerCurrencyAccountEntity)
    private currencyRepo: Repository<CustomerCurrencyAccountEntity>,

    @InjectRepository(CustomerCurrencyEntryEntity)
    private entryRepo: Repository<CustomerCurrencyEntryEntity>,
  ) {}

  async createCurrencyAccount(
    dto: CustomerCreateCurrencyAccountDto,
    adminId: string,
  ) {
    const exists = await this.currencyRepo.findOne({
      where: { name: dto.name },
    });

    if (exists) {
      throw new BadRequestException('Account with this name already exists');
    }

    const currencyAcc = this.currencyRepo.create({
      accountType: dto.accountType,
      name: dto.name,
      accountInfo: dto.accountInfo,
      adminId: adminId,
    });

    return this.currencyRepo.save(currencyAcc);
  }

  async getCustomerById(id: string) {
    const customer = await this.currencyRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer account not found');
    return customer;
  }

  async getCustomersByAdmin(adminId: string, paginationDto: PaginationDto) {
    const { offset = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.currencyRepo.findAndCount({
      where: { adminId },
      skip: (offset - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return buildPaginationResponse(data, total, offset, limit);
  }

  async updateCustomer(id: string, dto: UpdateCustomerCurrencyAccountDto) {
    const customer = await this.currencyRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer account not found');

    Object.assign(customer, dto);
    return this.currencyRepo.save(customer);
  }

  async createCurrencyEntry(dto: CreateCurrencyEntryDto, adminId: string) {
    const account = await this.currencyRepo.findOne({
      where: { id: dto.accountId },
    });
    if (!account) throw new NotFoundException('Customer account not found');

    if (dto.entryType === EntryType.JAMAM) {
      account.balance += dto.amount; // Credit
    } else if (dto.entryType === EntryType.BANAM) {
      account.balance -= dto.amount; // Debit
      if (account.balance < 0) {
        throw new BadRequestException(
          'Insufficient balance for debit transaction',
        );
      }
    }

    const entry = this.entryRepo.create({
      date: dto.date,
      paymentType: dto.paymentType,
      account,
      amount: dto.amount,
      description: dto.description,
      entryType: dto.entryType,
      adminId: adminId,
    });

    await this.entryRepo.save(entry);
    await this.currencyRepo.save(account);

    return { entry, updatedBalance: account.balance };
  }

  async createMultipleCurrencyEntries(
    dto: CreateMultipleCurrencyEntryDto,
    adminId: string,
  ) {
    if (!dto.entries || dto.entries.length === 0) {
      throw new BadRequestException('No entries provided');
    }

    const results = [];
    const accountMap: Map<string, CustomerCurrencyAccountEntity> = new Map();

    // Step 1: preload all accounts involved in the entries
    const accountIds = [...new Set(dto.entries.map((e) => e.accountId))]; // unique account IDs
    const accounts = await this.currencyRepo.findByIds(accountIds);

    // map accounts by ID for easy access
    accounts.forEach((acc) => accountMap.set(acc.id, acc));

    // Step 2: process each entry in order
    for (const entryDto of dto.entries) {
      const account = accountMap.get(entryDto.accountId);
      if (!account) {
        throw new NotFoundException(
          `Customer account not found: ${entryDto.accountId}`,
        );
      }

      // update balance according to entry type
      if (entryDto.entryType === EntryType.JAMAM) {
        account.balance += entryDto.amount; // credit
      } else if (entryDto.entryType === EntryType.BANAM) {
        if (account.balance < entryDto.amount) {
          throw new BadRequestException(
            `Insufficient balance for account ${account.id} on debit`,
          );
        }
        account.balance -= entryDto.amount; // debit
      }

      // create entry
      const entry = this.entryRepo.create({
        date: entryDto.date,
        paymentType: entryDto.paymentType,
        account,
        amount: entryDto.amount,
        description: entryDto.description,
        entryType: entryDto.entryType,
        adminId,
      });

      results.push({ entry, updatedBalance: account.balance });
    }

    // Step 3: save all entries at once (batch insert)
    await this.entryRepo.save(results.map((r) => r.entry));

    // Step 4: save all updated accounts at once
    await this.currencyRepo.save(Array.from(accountMap.values()));

    return results;
  }
}
