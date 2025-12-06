import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
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
import { DailyBookDto } from '../domain/dto/daily-book.dto';
import { AdminEntity } from 'src/modules/users/domain/entities/admin.entity';
import { UserEntity } from 'src/modules/users/domain/entities/user.entity';
import { AddCurrencyEntity } from 'src/modules/account/domain/entity/currency.entity';

@Injectable()
export class CurrencyAccountService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepo: Repository<AdminEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(CustomerCurrencyAccountEntity)
    private currencyRepo: Repository<CustomerCurrencyAccountEntity>,

    @InjectRepository(CustomerCurrencyEntryEntity)
    private entryRepo: Repository<CustomerCurrencyEntryEntity>,

    @InjectRepository(AddCurrencyEntity)
    private currencyAccountRepo: Repository<AddCurrencyEntity>,
  ) {}

  async createCurrencyAccount(
    dto: CustomerCreateCurrencyAccountDto,
    adminId: string,
  ) {
    const exists = await this.currencyRepo.findOne({
      where: { name: dto.name },
    });

    const currencyAccount = await this.currencyAccountRepo.findOne({
      where: { id: dto.currencyId },
    });

    if (!currencyAccount) {
      throw new BadRequestException('Currency Account Does Not Exists');
    }
    if (exists) {
      throw new BadRequestException('Account with this name already exists');
    }

    const currencyAcc = this.currencyRepo.create({
      accountType: dto.accountType,
      name: dto.name,
      accountInfo: dto.accountInfo,
      currencyId: dto.currencyId,
      adminId: adminId,
    });

    return this.currencyRepo.save(currencyAcc);
  }

  async getCustomerById(id: string) {
    const customer = await this.currencyRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer account not found');
    return customer;
  }

  async getCustomersByAdmin(
    adminId: string,
    currency: string,
    paginationDto: PaginationDto,
  ) {
    const { offset = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.currencyRepo.findAndCount({
      where: { adminId, currencyId: currency },
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

  async getGenericUserId(adminId: string) {
    const result = await this.adminRepo
      .createQueryBuilder('admin')
      .leftJoin(
        'user_profiles',
        'userProfiles',
        'admin.user_profile_id = userProfiles.id',
      )
      .leftJoin('users', 'User', 'User.id = userProfiles.user_id')
      .select('User.id', 'userId')
      .where('admin.id = :adminId', { adminId })
      .getRawOne();

    return result?.userId || null;
  }

  async createCurrencyEntry(dto: CreateCurrencyEntryDto, adminId: string) {
    const account = await this.currencyRepo.findOne({
      where: { id: dto.accountId },
    });
    const AdminInfo = await this.getGenericUserId(adminId);

    const admin = await this.userRepo.findOne({
      where: { id: AdminInfo },
    });
    console.log('Admin here clddlldld', admin.id);

    if (!account) throw new NotFoundException('Customer account not found');

    if (dto.entryType === EntryType.JAMAM) {
      // Credit (Money added)
      account.balance += dto.amount;
      admin.account_balance -= dto.amount;
    } else if (dto.entryType === EntryType.BANAM) {
      // Debit (Money removed) — allow negative
      account.balance -= dto.amount;
      admin.account_balance += dto.amount;
    }

    await this.userRepo.save(admin);
    await this.currencyRepo.save(account);

    const entry = this.entryRepo.create({
      date: dto.date,
      paymentType: dto.paymentType,
      account,
      amount: dto.amount,
      description: dto.description,
      entryType: dto.entryType,
      adminId: adminId,
      balance: account.balance,
    });

    await this.entryRepo.save(entry);

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

    // Fetch admin actual ID
    const AdminInfo = await this.getGenericUserId(adminId);

    const admin = await this.userRepo.findOne({
      where: { id: AdminInfo },
    });

    if (!admin) throw new NotFoundException('Admin not found');

    // Step 1: Preload all accounts involved
    const accountMap: Map<string, CustomerCurrencyAccountEntity> = new Map();
    const accountIds = [...new Set(dto.entries.map((e) => e.accountId))];

    const accounts = await this.currencyRepo.findByIds(accountIds);
    accounts.forEach((acc) => accountMap.set(acc.id, acc));

    // Step 2: Process each entry
    for (const entryDto of dto.entries) {
      const account = accountMap.get(entryDto.accountId);
      if (!account) {
        throw new NotFoundException(
          `Customer account not found: ${entryDto.accountId}`,
        );
      }

      // Update balances exactly like createCurrencyEntry()
      if (entryDto.entryType === EntryType.JAMAM) {
        // Credit to customer → admin loses money
        account.balance += entryDto.amount;
        admin.account_balance -= entryDto.amount;
      } else if (entryDto.entryType === EntryType.BANAM) {
        // Debit from customer → admin gains money
        account.balance -= entryDto.amount;
        admin.account_balance += entryDto.amount;
      }

      // Create entry
      const entry = this.entryRepo.create({
        date: entryDto.date,
        paymentType: entryDto.paymentType,
        account,
        amount: entryDto.amount,
        description: entryDto.description,
        entryType: entryDto.entryType,
        adminId: adminId,
        balance: account.balance,
      });

      results.push({ entry, updatedBalance: account.balance });
    }

    // Step 3: Save all entries
    await this.entryRepo.save(results.map((r) => r.entry));

    // Step 4: Save updated accounts
    await this.currencyRepo.save(Array.from(accountMap.values()));

    // Step 5: Save updated admin balance once
    await this.userRepo.save(admin);

    return results;
  }

  async getDailyBook(filter: DailyBookDto, adminId: string) {
    const date = new Date(filter.date);

    const entries = await this.entryRepo.find({
      where: { date: date, adminId: adminId },
      relations: ['account'],
      order: { created_at: 'DESC' },
    });

    return entries.map((entry) => ({
      accountName: entry.account?.name,
      narration: `${entry.account?.name} To ${entry.description ?? ''}`.trim(),
      debitAmount: entry.entryType === EntryType.BANAM ? entry.amount : 0,
      creditAmount: entry.entryType === EntryType.JAMAM ? entry.amount : 0,
    }));
  }

  async getLedgers(adminId: string, accountId: string) {
    try {
      const account = await this.currencyRepo.findOne({
        where: { id: accountId, adminId: adminId },
      });

      if (!account) {
        throw new BadRequestException(
          'No Account Found of This User in Your Profile',
        );
      }

      const entries = await this.entryRepo.find({
        where: { account: { id: accountId } },
      });

      if (!entries || entries.length === 0) {
        throw new BadRequestException('There is no Entry of this User Account');
      }

      const Accountentries = entries.map((entry) => ({
        entryDate: entry.date,
        accountName: entry.account?.name,
        paymentType: entry.paymentType,
        narration:
          `${entry.account?.name} To ${entry.description ?? ''}`.trim(),
        debitAmount: entry.entryType === EntryType.BANAM ? entry.amount : 0,
        creditAmount: entry.entryType === EntryType.JAMAM ? entry.amount : 0,
        entryBalance: entry.balance,
      }));

      let totalCr = 0;
      let totalDr = 0;

      entries.forEach((entry) => {
        if (entry.entryType === EntryType.JAMAM) {
          totalCr += entry.amount;
        } else {
          totalDr += entry.amount;
        }
      });

      const total = totalCr - totalDr; // Credit − Debit

      return {
        accountName: account.name,
        entries: Accountentries,
        totals: {
          totalCr,
          totalDr,
          netBalance: total, // Credit - Debit
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }
}
