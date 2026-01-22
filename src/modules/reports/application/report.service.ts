// All Reports Service With Redis and High Scalability and Performance
import { Injectable, Inject, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerCurrencyEntryEntity } from '../../currency/domain/entities/currency-entry.entity';
import { PurchaseEntryEntity } from '../../sale-purchase/domain/entity/purchase_entries.entity';
import { SellingEntryEntity } from '../../sale-purchase/domain/entity/selling_entries.entity';
import { RedisService } from '../../../shared/modules/redis/redis.service';
import { Between, Repository } from 'typeorm';
import { CurrencyStockEntity } from '../../currency/domain/entities/currency-stock.entity';
import { AddCurrencyEntity } from '../../account/domain/entity/currency.entity';
import { JournalEntryEntity } from '../../journal/domain/entity/journal-entry.entity';
import { BankPaymentEntryEntity } from '../../journal/domain/entity/bank-payment-entry.entity';
import { BankReceiverEntryEntity } from '../../journal/domain/entity/bank-receiver-entry.entity';
import { CashPaymentEntryEntity } from '../../journal/domain/entity/cash-payment-entry.entity';
import { CashReceivedEntryEntity } from '../../journal/domain/entity/cash-received-entry.entity';
import { AccountBalanceEntity } from '../../journal/domain/entity/account-balance.entity';
import { AccountLedgerEntity } from '../../journal/domain/entity/account-ledger.entity';
import { GeneralLedgerEntity } from '../../journal/domain/entity/general-ledger.entity';
import { CustomerAccountEntity } from '../../account/domain/entity/customer-account.entity';
import { BankAccountEntity } from '../../account/domain/entity/bank-account.entity';
import { GeneralAccountEntity } from '../../account/domain/entity/general-account.entity';
import {
  BalanceSheetResponse,
  DetailedBalanceSheetResponse,
  CurrencyBalance,
  CustomerBalance,
  BankBalance,
  GeneralAccountBalance,
  DetailedAccountLedger,
  DetailedBalanceSheetEntry,
} from '../domain/dto/balance-sheet.dto';
import {
  CurrencyIncomeStatementResponse,
  CurrencyIncomeStatement,
  CurrencyIncomeStatementSummary,
} from '../domain/dto/income-statement.dto';
import {
  CurrencyLedgerResponse,
  CurrencyLedgerByDate,
  CurrencyLedgerEntry,
} from '../domain/dto/currency-ledger.dto';
import {
  AccountLedgerResponse,
  AccountLedgerEntry,
  AccountLedgerTotals,
} from '../domain/dto/account-ledger.dto';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private readonly CACHE_DURATION = 3600;
  private readonly QUERY_TIMEOUT = 30000;

  private toISODateString(input: any): string {
    if (!input) return '';
    try {
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d.getTime())) {
        const s = String(input);
        return s.length >= 10 ? s.slice(0, 10) : s;
      }
      return d.toISOString().split('T')[0];
    } catch {
      const s = String(input);
      return s.length >= 10 ? s.slice(0, 10) : s;
    }
  }

  constructor(
    @InjectRepository(SellingEntryEntity)
    private readonly sellingEntryRepository: Repository<SellingEntryEntity>,

    @InjectRepository(PurchaseEntryEntity)
    private readonly purchaseEntryRepository: Repository<PurchaseEntryEntity>,

    @InjectRepository(CustomerCurrencyEntryEntity)
    private readonly currencyEntryRepository: Repository<CustomerCurrencyEntryEntity>,

    @InjectRepository(CurrencyStockEntity)
    private readonly currencyStockRepository: Repository<CurrencyStockEntity>,

    @InjectRepository(JournalEntryEntity)
    private readonly journalEntryRepository: Repository<JournalEntryEntity>,

    @InjectRepository(BankPaymentEntryEntity)
    private readonly bankPaymentRepository: Repository<BankPaymentEntryEntity>,

    @InjectRepository(BankReceiverEntryEntity)
    private readonly bankReceiverRepository: Repository<BankReceiverEntryEntity>,

    @InjectRepository(CashPaymentEntryEntity)
    private readonly cashPaymentRepository: Repository<CashPaymentEntryEntity>,

    @InjectRepository(CashReceivedEntryEntity)
    private readonly cashReceivedRepository: Repository<CashReceivedEntryEntity>,

    @InjectRepository(AccountBalanceEntity)
    private readonly accountBalanceRepository: Repository<AccountBalanceEntity>,

    @InjectRepository(AccountLedgerEntity)
    private readonly accountLedgerRepository: Repository<AccountLedgerEntity>,

    @InjectRepository(GeneralLedgerEntity)
    private readonly generalLedgerRepository: Repository<GeneralLedgerEntity>,

    @InjectRepository(CustomerAccountEntity)
    private readonly customerAccountRepository: Repository<CustomerAccountEntity>,

    @InjectRepository(BankAccountEntity)
    private readonly bankAccountRepository: Repository<BankAccountEntity>,

    @InjectRepository(GeneralAccountEntity)
    private readonly generalAccountRepository: Repository<GeneralAccountEntity>,

    @InjectRepository(AddCurrencyEntity)
    private readonly currencyRepository: Repository<AddCurrencyEntity>,

    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  async currencyStocks(adminId: string): Promise<{
    items: Array<{
      name: string;
      code: string;
      amountPkr: number;
      amountCurrency: number;
      rate: number;
    }>;
    totals: { amountPkr: number; amountCurrency: number };
  }> {
    try {
      // Check cache first
      const cacheKey = `currencyStocks:${adminId}`;
      const cached = await this.redisService.getValue(cacheKey);
      if (cached) {
        this.logger.debug(`✅ Currency Stocks cache HIT for admin: ${adminId}`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Currency Stocks cache MISS for admin: ${adminId}`);

      // Optimized query with only necessary columns and eager join
      const rows = await Promise.race<any[]>([
        this.currencyStockRepository
          .createQueryBuilder('cs')
          .innerJoin(AddCurrencyEntity, 'c', 'c.id = cs.currency_id')
          .where('cs.adminId = :adminId', { adminId })
          .andWhere('cs.currencyAmount > 0')
          .select('c.name', 'name')
          .addSelect('c.code', 'code')
          .addSelect('cs.stockAmountPkr', 'amountPkr')
          .addSelect('cs.currencyAmount', 'amountCurrency')
          .addSelect('cs.rate', 'rate')
          .orderBy('c.name', 'ASC')
          .getRawMany(),
        new Promise<any[]>((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), this.QUERY_TIMEOUT),
        ),
      ]);

      const items = rows.map((r) => ({
        name: r.name || '',
        code: r.code || '',
        amountPkr: Number(r.amountPkr) || 0,
        amountCurrency: Number(r.amountCurrency) || 0,
        rate: Number(r.rate) || 0,
      }));

      const totals = items.reduce(
        (acc, cur) => {
          acc.amountPkr += cur.amountPkr;
          acc.amountCurrency += cur.amountCurrency;
          return acc;
        },
        { amountPkr: 0, amountCurrency: 0 },
      );

      const result = { items, totals };

      // Cache the result
      await this.redisService.setValue(cacheKey, JSON.stringify(result), this.CACHE_DURATION);

      return result;
    } catch (error) {
      this.logger.error(`Error fetching currency stocks for admin ${adminId}:`, error);
      if (error.message === 'Query timeout') {
        throw new InternalServerErrorException(
          'Currency stocks query took too long. Please try again later.',
        );
      }
      throw new InternalServerErrorException(
        'Unable to fetch currency stocks. Please contact support if the issue persists.',
      );
    }
  }

  async invalidateCachesAfterPurchaseEntry(
    adminId: string,
    customerId?: string,
    currencyId?: string,
    date?: string,
  ): Promise<void> {
    try {
      // Immediate stocks may change
      await this.redisService.deleteKey(`currencyStocks:${adminId}`);

      // Daily reports: target specific date if provided, else all
      if (date) {
        await this.redisService.deleteKey(`dailyBooksReport:${adminId}:${date}`);
      } else {
        await this.redisService.deleteKeysByPattern(`dailyBooksReport:${adminId}:*`);
      }
      await this.redisService.deleteKeysByPattern(`dailyBuyingReport:${adminId}:*`);
      await this.redisService.deleteKeysByPattern(`dailySellingReport:${adminId}:*`);
      await this.redisService.deleteKeysByPattern(`dailySellingReportByCurrency:${adminId}:*`);

      // Ledgers per currency
      if (currencyId) {
        await this.redisService.deleteKeysByPattern(`ledgersCurrencyReport:${adminId}:*:*:${currencyId}`);
      } else {
        await this.redisService.deleteKeysByPattern(`ledgersCurrencyReport:${adminId}:*`);
      }

      // Balance sheets
      await this.redisService.deleteKeysByPattern(`balanceSheet:${adminId}:*`);
      await this.redisService.deleteKeysByPattern(`detailedBalanceSheet:${adminId}:*`);

      // Income statement
      await this.redisService.deleteKeysByPattern(`currency:income:statement:${adminId}:*`);

      // Customer + currency purchase report cache
      if (customerId && currencyId) {
        await this.redisService.deleteKeysByPattern(
          `customerCurrencyPurchase:${adminId}:${customerId}:${currencyId}:*`,
        );
      }
    } catch (e) {
      this.logger.warn(`Cache invalidation (purchase) failed: ${e?.message || e}`);
    }
  }

  async invalidateCachesAfterSellingEntry(
    adminId: string,
    customerId?: string,
    currencyId?: string,
    date?: string,
  ): Promise<void> {
    try {
      // Stocks change
      await this.redisService.deleteKey(`currencyStocks:${adminId}`);

      // Daily reports
      if (date) {
        await this.redisService.deleteKey(`dailyBooksReport:${adminId}:${date}`);
      } else {
        await this.redisService.deleteKeysByPattern(`dailyBooksReport:${adminId}:*`);
      }
      await this.redisService.deleteKeysByPattern(`dailySellingReport:${adminId}:*`);
      await this.redisService.deleteKeysByPattern(`dailySellingReportByCurrency:${adminId}:*`);

      // Ledgers per currency
      if (currencyId) {
        await this.redisService.deleteKeysByPattern(`ledgersCurrencyReport:${adminId}:*:*:${currencyId}`);
      } else {
        await this.redisService.deleteKeysByPattern(`ledgersCurrencyReport:${adminId}:*`);
      }

      // Balance sheets
      await this.redisService.deleteKeysByPattern(`balanceSheet:${adminId}:*`);
      await this.redisService.deleteKeysByPattern(`detailedBalanceSheet:${adminId}:*`);

      // Income statement
      await this.redisService.deleteKeysByPattern(`currency:income:statement:${adminId}:*`);

      // Customer + currency sale report cache
      if (customerId && currencyId) {
        await this.redisService.deleteKeysByPattern(
          `customerCurrencySales:${adminId}:${customerId}:${currencyId}:*`,
        );
      }
    } catch (e) {
      this.logger.warn(`Cache invalidation (selling) failed: ${e?.message || e}`);
    }
  }

  async invalidateAllReportCachesForAdmin(adminId: string): Promise<number> {
    const patterns = [
      `currencyStocks:${adminId}`,
      `dailyBooksReport:${adminId}:*`,
      `dailyBuyingReport:${adminId}:*`,
      `dailySellingReport:${adminId}:*`,
      `dailySellingReportByCurrency:${adminId}:*`,
      `ledgersCurrencyReport:${adminId}:*`,
      `balanceSheet:${adminId}:*`,
      `detailedBalanceSheet:${adminId}:*`,
      `currency:income:statement:${adminId}:*`,
      `customerCurrencyPurchase:${adminId}:*`,
      `customerCurrencySales:${adminId}:*`,
    ];

    let deleted = 0;
    for (const p of patterns) {
      if (p.endsWith(`${adminId}`)) {
        await this.redisService.deleteKey(p);
        deleted += 1;
      } else {
        deleted += await this.redisService.deleteKeysByPattern(p);
      }
    }
    return deleted;
  }

  // New targeted invalidation helpers for journal entries
  async invalidateCachesAfterBankPaymentEntry(adminId: string, date?: string): Promise<void> {
    try {
      if (date) {
        await this.redisService.deleteKey(`dailyBooksReport:${adminId}:${date}`);
      } else {
        await this.redisService.deleteKeysByPattern(`dailyBooksReport:${adminId}:*`);
      }
    } catch (e) {
      this.logger.warn(`Cache invalidation (bank payment) failed: ${e?.message || e}`);
    }
  }

  async invalidateCachesAfterBankReceiverEntry(adminId: string, date?: string): Promise<void> {
    try {
      if (date) {
        await this.redisService.deleteKey(`dailyBooksReport:${adminId}:${date}`);
      } else {
        await this.redisService.deleteKeysByPattern(`dailyBooksReport:${adminId}:*`);
      }
    } catch (e) {
      this.logger.warn(`Cache invalidation (bank receiver) failed: ${e?.message || e}`);
    }
  }

  async invalidateCachesAfterCashPaymentEntry(adminId: string, date?: string): Promise<void> {
    try {
      if (date) {
        await this.redisService.deleteKey(`dailyBooksReport:${adminId}:${date}`);
      } else {
        await this.redisService.deleteKeysByPattern(`dailyBooksReport:${adminId}:*`);
      }
    } catch (e) {
      this.logger.warn(`Cache invalidation (cash payment) failed: ${e?.message || e}`);
    }
  }

  async invalidateCachesAfterCashReceivedEntry(adminId: string, date?: string): Promise<void> {
    try {
      if (date) {
        await this.redisService.deleteKey(`dailyBooksReport:${adminId}:${date}`);
      } else {
        await this.redisService.deleteKeysByPattern(`dailyBooksReport:${adminId}:*`);
      }
    } catch (e) {
      this.logger.warn(`Cache invalidation (cash received) failed: ${e?.message || e}`);
    }
  }

  async dailyBooksReport(adminId: string, date: string): Promise<any> {
    try {
      // Validate date format
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
      }

      const cacheKey = `dailyBooksReport:${adminId}:${date}`;
      const cached = await this.redisService.getValue(cacheKey);

      if (cached) {
        this.logger.debug(`✅ Daily Books Report cache HIT for ${date}`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Daily Books Report cache MISS for ${date}`);

      // Optimized parallel queries with timeout
      const [
        sellingEntries,
        purchaseEntries,
        currencyEntries,
        bankPaymentEntries,
        bankReceiverEntries,
        cashPaymentEntries,
        cashReceivedEntries,
      ] = await Promise.race<any[]>([
        Promise.all([
          // Selling
          this.sellingEntryRepository
            .createQueryBuilder('s')
            .leftJoin('s.customerAccount', 'customer')
            .where('s.adminId = :adminId', { adminId })
            .andWhere('s.date = :date', { date })
            .select([
              's.id',
              's.sNo',
              's.amountCurrency',
              's.amountPkr',
              's.rate',
              's.date',
              'customer.name',
            ])
            .orderBy('s.date', 'ASC')
            .take(1000)
            .getMany(),
          // Purchase
          this.purchaseEntryRepository
            .createQueryBuilder('p')
            .leftJoin('p.customerAccount', 'customer')
            .where('p.adminId = :adminId', { adminId })
            .andWhere('p.date = :date', { date })
            .select([
              'p.id',
              'p.purchaseNumber',
              'p.amountCurrency',
              'p.amountPkr',
              'p.rate',
              'p.date',
              'customer.name',
            ])
            .orderBy('p.date', 'ASC')
            .take(1000)
            .getMany(),
          // Currency account entries
          this.currencyEntryRepository
            .createQueryBuilder('ce')
            .leftJoin('ce.account', 'acc')
            .leftJoin(AddCurrencyEntity, 'cur', 'cur.id = acc.currencyId')
            .where('ce.adminId = :adminId', { adminId })
            .andWhere('ce.date = :date', { date })
            .select([
              'ce.id',
              'ce.date',
              'ce.amount',
              'ce.balance',
              'ce.entryType',
              'acc.id',
              'cur.name',
              'cur.code',
            ])
            .orderBy('ce.date', 'ASC')
            .take(1000)
            .getMany(),
          // Bank payment (Bank -> Customer)
          this.bankPaymentRepository
            .createQueryBuilder('bp')
            .leftJoin('bp.crAccount', 'bank')
            .leftJoin('bp.drAccount', 'cust')
            .where('bp.adminId = :adminId', { adminId })
            .andWhere('bp.date = :date', { date })
            .select([
              'bp.id',
              'bp.date',
              'bp.amount',
              'bp.description',
              'bp.chqNo',
              'bank.bankName',
              'bank.accountNumber',
              'cust.name',
            ])
            .orderBy('bp.date', 'ASC')
            .take(1000)
            .getMany(),
          // Bank receiver (Customer -> Bank)
          this.bankReceiverRepository
            .createQueryBuilder('br')
            .leftJoin('br.crAccount', 'cust')
            .leftJoin('br.drAccount', 'bank')
            .where('br.adminId = :adminId', { adminId })
            .andWhere('br.date = :date', { date })
            .select([
              'br.id',
              'br.date',
              'br.amount',
              'br.branchCode',
              'cust.name',
              'bank.bankName',
              'bank.accountNumber',
            ])
            .orderBy('br.date', 'ASC')
            .take(1000)
            .getMany(),
          // Cash payment (Cash -> Customer)
          this.cashPaymentRepository
            .createQueryBuilder('cp')
            .leftJoin('cp.drAccount', 'cust')
            .where('cp.adminId = :adminId', { adminId })
            .andWhere('cp.date = :date', { date })
            .select([
              'cp.id',
              'cp.date',
              'cp.amount',
              'cp.description',
              'cust.name',
            ])
            .orderBy('cp.date', 'ASC')
            .take(1000)
            .getMany(),
          // Cash received (Customer -> Cash)
          this.cashReceivedRepository
            .createQueryBuilder('cr')
            .leftJoin('cr.crAccount', 'cust')
            .where('cr.adminId = :adminId', { adminId })
            .andWhere('cr.date = :date', { date })
            .select([
              'cr.id',
              'cr.date',
              'cr.amount',
              'cr.description',
              'cust.name',
            ])
            .orderBy('cr.date', 'ASC')
            .take(1000)
            .getMany(),
        ]),
        new Promise<any[]>((_, reject) =>
          setTimeout(
            () => reject(new Error('Daily books report query took too long')),
            this.QUERY_TIMEOUT,
          ),
        ),
      ]);

      const response = {
        sellingEntries: sellingEntries || [],
        purchaseEntries: purchaseEntries || [],
        currencyEntries: currencyEntries || [],
        bankPaymentEntries: bankPaymentEntries || [],
        bankReceiverEntries: bankReceiverEntries || [],
        cashPaymentEntries: cashPaymentEntries || [],
        cashReceivedEntries: cashReceivedEntries || [],
        date,
        recordCount:
          (sellingEntries?.length || 0) +
          (purchaseEntries?.length || 0) +
          (currencyEntries?.length || 0) +
          (bankPaymentEntries?.length || 0) +
          (bankReceiverEntries?.length || 0) +
          (cashPaymentEntries?.length || 0) +
          (cashReceivedEntries?.length || 0),
      };

      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching daily books report for ${date}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to fetch daily books report. Please ensure the date is valid and try again.',
      );
    }
  }

  async dailyBuyingReport(adminId: string, date: string): Promise<any> {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
      }

      const cacheKey = `dailyBuyingReport:${adminId}:${date}`;
      const cached = await this.redisService.getValue(cacheKey);
      if (cached) {
        this.logger.debug(`✅ Daily Buying Report cache HIT for ${date}`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Daily Buying Report cache MISS for ${date}`);

      const purchaseEntries = await Promise.race<any[]>([
        this.purchaseEntryRepository
          .createQueryBuilder('pe')
          .leftJoin('pe.customerAccount', 'ca')
          .where('pe.adminId = :adminId', { adminId })
          .andWhere('pe.date = :date', { date })
          .select([
            'pe.id',
            'pe.purchaseNumber',
            'pe.amountCurrency',
            'pe.amountPkr',
            'pe.rate',
            'ca.name',
          ])
          .orderBy('pe.date', 'DESC')
          .take(1000)
          .getMany(),
        new Promise<any[]>((_, reject) =>
          setTimeout(
            () => reject(new Error('Daily buying report query took too long')),
            this.QUERY_TIMEOUT,
          ),
        ),
      ]);

      const entry = purchaseEntries.map((entry) => ({
        purchaseNumber: entry.purchaseNumber,
        customerName: entry.customerAccount?.name || 'Unknown',
        amount: Number(entry.amountCurrency) || 0,
        rate: Number(entry.rate) || 0,
        amountPKR: Number(entry.amountPkr) || 0,
      }));

      const totalCurrencyAmount = purchaseEntries.reduce(
        (sum, entry) => sum + (Number(entry.amountCurrency) || 0),
        0,
      );
      const totalPkrAmount = purchaseEntries.reduce(
        (sum, entry) => sum + (Number(entry.amountPkr) || 0),
        0,
      );

      const response = {
        entry,
        totalCurrencyAmount: Math.round(totalCurrencyAmount * 100) / 100,
        totalPkrAmount: Math.round(totalPkrAmount * 100) / 100,
        recordCount: purchaseEntries.length,
        date,
      };

      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching daily buying report for ${date}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to fetch daily buying report. Please try again later.',
      );
    }
  }

  async dailySellingReport(adminId: string, date: string): Promise<any> {
    try {
      // Validate date
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
      }

      const cacheKey = `dailySellingReport:${adminId}:${date}`;
      const cached = await this.redisService.getValue(cacheKey);

      if (cached) {
        this.logger.debug(`✅ Daily Selling Report cache HIT for ${date}`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Daily Selling Report cache MISS for ${date}`);

      // Optimized parallel queries with timeout
      const [sellingEntries, sellingTotals, purchaseTotals] = await Promise.race<any[]>([
        Promise.all([
          this.sellingEntryRepository
            .createQueryBuilder('s')
            .leftJoin('s.customerAccount', 'customer')
            .leftJoin('s.fromCurrency', 'currency')
            .where('s.adminId = :adminId', { adminId })
            .andWhere('s.date = :date', { date })
            .select([
              's.id',
              's.sNo',
              's.amountCurrency',
              's.amountPkr',
              's.rate',
              's.pl',
              'customer.name',
              'currency.name',
            ])
            .orderBy('s.date', 'DESC')
            .take(1000)
            .getMany(),
          this.sellingEntryRepository
            .createQueryBuilder('s')
            .where('s.adminId = :adminId', { adminId })
            .andWhere('s.date = :date', { date })
            .select([
              'SUM(s.amountCurrency) as totalCurrency',
              'SUM(s.amountPkr) as totalPkr',
              'SUM(s.pl) as totalPl',
            ])
            .getRawOne(),
          this.purchaseEntryRepository
            .createQueryBuilder('p')
            .where('p.adminId = :adminId', { adminId })
            .andWhere('p.date = :date', { date })
            .select([
              'SUM(p.amountCurrency) as totalCurrency',
              'SUM(p.amountPkr) as totalPkr',
            ])
            .getRawOne(),
        ]),
        new Promise<any[]>((_, reject) =>
          setTimeout(
            () => reject(new Error('Daily selling report query took too long')),
            this.QUERY_TIMEOUT,
          ),
        ),
      ]);

      const sellingList = sellingEntries.map((entry) => ({
        sNo: entry.sNo,
        customerName: entry.customerAccount?.name || 'Unknown',
        currencyAccount: entry.fromCurrency?.name || 'Unknown',
        amount: Number(entry.amountCurrency) || 0,
        rate: Number(entry.rate) || 0,
        amountPKR: Number(entry.amountPkr) || 0,
        pl: Number(entry.pl) || 0,
      }));

      const buyingPkr = Number(purchaseTotals?.totalPkr || 0);
      const sellingPkr = Number(sellingTotals?.totalPkr || 0);

      const response = {
        entry: sellingList,
        grandTotal: {
          buying: {
            amount: Number(purchaseTotals?.totalCurrency || 0),
            pkr: buyingPkr,
          },
          selling: {
            amount: Number(sellingTotals?.totalCurrency || 0),
            pkr: sellingPkr,
            pnl: Number(sellingTotals?.totalPl || 0),
          },
          totals: {
            pkr: sellingPkr - buyingPkr,
          },
        },
        recordCount: sellingEntries.length,
        date,
      };

      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching daily selling report for ${date}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to fetch daily selling report. Please try again later.',
      );
    }
  }

  async dailySellingReportByCurrency(adminId: string, date: string): Promise<any> {
    try {
      // Validate date
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
      }

      const cacheKey = `dailySellingReportByCurrency:${adminId}:${date}`;
      const cached = await this.redisService.getValue(cacheKey);

      if (cached) {
        this.logger.debug(`✅ Daily Selling Report By Currency cache HIT for ${date}`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Daily Selling Report By Currency cache MISS for ${date}`);

      const [sellingEntries, sellingTotals] = await Promise.race<any[]>([
        Promise.all([
          this.sellingEntryRepository
            .createQueryBuilder('s')
            .leftJoin('s.customerAccount', 'customer')
            .leftJoin('s.fromCurrency', 'currency')
            .where('s.adminId = :adminId', { adminId })
            .andWhere('s.date = :date', { date })
            .select([
              's.id',
              's.sNo',
              's.amountCurrency',
              's.amountPkr',
              's.rate',
              's.pl',
              'customer.name',
              'currency.name',
            ])
            .orderBy('s.date', 'DESC')
            .take(1000)
            .getMany(),
          this.sellingEntryRepository
            .createQueryBuilder('s')
            .where('s.adminId = :adminId', { adminId })
            .andWhere('s.date = :date', { date })
            .select([
              's.fromCurrencyId as currencyId',
              'SUM(s.amountCurrency) as totalCurrency',
              'SUM(s.amountPkr) as totalPkr',
              'SUM(s.pl) as totalPl',
            ])
            .groupBy('s.fromCurrencyId')
            .getRawMany(),
        ]),
        new Promise<any[]>((_, reject) =>
          setTimeout(
            () => reject(new Error('Daily selling report query took too long')),
            this.QUERY_TIMEOUT,
          ),
        ),
      ]);

      // Group by currency
      const byCurrency = new Map<string, any>();
      sellingEntries.forEach((entry) => {
        const currencyId = entry.fromCurrency?.id || 'unknown';
        if (!byCurrency.has(currencyId)) {
          byCurrency.set(currencyId, {
            currency: entry.fromCurrency?.name || 'Unknown',
            entries: [],
            total: { currency: 0, pkr: 0, pl: 0 },
          });
        }
        const curr = byCurrency.get(currencyId)!;
        curr.entries.push({
          sNo: entry.sNo,
          customerName: entry.customerAccount?.name || 'Unknown',
          amount: Number(entry.amountCurrency) || 0,
          rate: Number(entry.rate) || 0,
          amountPKR: Number(entry.amountPkr) || 0,
          pl: Number(entry.pl) || 0,
        });
      });

      // Add totals from aggregated query
      sellingTotals.forEach((total) => {
        const curr = byCurrency.get(total.currencyId);
        if (curr) {
          curr.total = {
            currency: Number(total.totalCurrency) || 0,
            pkr: Number(total.totalPkr) || 0,
            pl: Number(total.totalPl) || 0,
          };
        }
      });

      const response = {
        byCurrency: Array.from(byCurrency.values()),
        recordCount: sellingEntries.length,
        date,
      };

      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching daily selling report by currency for ${date}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to fetch selling report by currency. Please try again later.',
      );
    }
  }

  async ledgersCurrencyReport(
    adminId: string,
    currencyId?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any> {
    try {
      if (!currencyId) {
        throw new BadRequestException('Currency ID is required for this report.');
      }

      const cacheKey = `ledgersCurrencyReport:${adminId}:${dateFrom}:${dateTo}:${currencyId}`;
      const cached = await this.redisService.getValue(cacheKey);
      if (cached) {
        this.logger.debug(`✅ Ledgers Currency Report cache HIT`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Ledgers Currency Report cache MISS`);

      const [sellingEntries, purchaseEntries] = await Promise.race<any[]>([
        Promise.all([
          this.sellingEntryRepository
            .createQueryBuilder('s')
            .leftJoin('s.customerAccount', 'customer')
            .where('s.adminId = :adminId', { adminId })
            .andWhere('s.fromCurrencyId = :currencyId', { currencyId })
            .select([
              's.id',
              's.sNo',
              's.date',
              's.amountCurrency',
              'customer.name',
            ])
            .andWhere(
              dateFrom && dateTo ? 'DATE(s.date) BETWEEN :from AND :to' : '1=1',
              dateFrom && dateTo ? { from: dateFrom, to: dateTo } : {},
            )
            .orderBy('s.date', 'ASC')
            .take(5000)
            .getMany(),
          this.purchaseEntryRepository
            .createQueryBuilder('p')
            .leftJoin('p.customerAccount', 'customer')
            .where('p.adminId = :adminId', { adminId })
            .andWhere('p.currencyDrId = :currencyId', { currencyId })
            .select([
              'p.id',
              'p.purchaseNumber',
              'p.date',
              'p.amountCurrency',
              'customer.name',
            ])
            .andWhere(
              dateFrom && dateTo ? 'DATE(p.date) BETWEEN :from AND :to' : '1=1',
              dateFrom && dateTo ? { from: dateFrom, to: dateTo } : {},
            )
            .orderBy('p.date', 'ASC')
            .take(5000)
            .getMany(),
        ]),
        new Promise<any[]>((_, reject) =>
          setTimeout(
            () => reject(new Error('Ledgers currency report query took too long')),
            this.QUERY_TIMEOUT,
          ),
        ),
      ]);

      // Normalize and combine entries
      const rows = [
        ...sellingEntries.map((e) => ({
          date: this.toISODateString(e.date),
          orderNo: e.sNo,
          narration: `Sale to ${e.customerAccount?.name || 'Customer'}${e.sNo ? ` (S.No: ${e.sNo})` : ''}`,
          dr: 0,
          cr: Number(e.amountCurrency) || 0,
        })),
        ...purchaseEntries.map((e) => ({
          date: this.toISODateString(e.date),
          orderNo: e.purchaseNumber,
          narration: `Purchase from ${e.customerAccount?.name || 'Customer'}${e.purchaseNumber ? ` (P.No: ${e.purchaseNumber})` : ''}`,
          dr: Number(e.amountCurrency) || 0,
          cr: 0,
        })),
      ];

      // Sort by date
      rows.sort((a, b) => a.date.localeCompare(b.date));

      // Group by date with running balance
      let balance = 0;
      const grouped = rows.reduce(
        (acc, row) => {
          if (!acc[row.date]) acc[row.date] = [];
          balance += row.cr - row.dr;
          acc[row.date].push({ ...row, balance: Math.round(balance * 100) / 100 });
          return acc;
        },
        {} as Record<string, any[]>,
      );

      const response = Object.entries(grouped).map(([date, entries]) => ({
        date,
        entries,
      }));

      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching ledgers currency report:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to fetch ledgers currency report. Please try again later.',
      );
    }
  }

  async getBalanceSheet(
    adminId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<BalanceSheetResponse> {
    try {
      const cacheKey = `balanceSheet:${adminId}:${dateFrom}:${dateTo}`;
      const cached = await this.redisService.getValue(cacheKey);

      if (cached) {
        this.logger.debug(`✅ Balance Sheet cache HIT`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Balance Sheet cache MISS - Computing from Transaction Tables`);

      // Build query condition for date range
      const whereCondition = dateFrom && dateTo
        ? { where: { adminId, date: Between(dateFrom, dateTo) } }
        : { where: { adminId } };

      // Optimized parallel queries with selective columns and limits
      const [sellingEntries, purchaseEntries, customers, banks, generals] = await Promise.race<any[]>([
        Promise.all([
          this.sellingEntryRepository.find({
            ...whereCondition,
            select: ['id', 'fromCurrencyId', 'amountCurrency'],
            relations: ['fromCurrency'],
            take: 10000,
          }),
          this.purchaseEntryRepository.find({
            ...whereCondition,
            select: ['id', 'currencyDrId', 'amountCurrency'],
            take: 10000,
          }),
          this.customerAccountRepository.find({
            where: { adminId },
            select: ['id', 'name', 'contact', 'email'],
            take: 1000,
          }),
          this.bankAccountRepository.find({
            where: { adminId },
            select: ['id', 'bankName', 'accountNumber', 'accountHolder'],
            take: 1000,
          }),
          this.generalAccountRepository.find({
            where: { adminId },
            select: ['id', 'name', 'accountType'],
            take: 1000,
          }),
        ]),
        new Promise<any[]>((_, reject) =>
          setTimeout(() => reject(new Error('Balance sheet query took too long')), this.QUERY_TIMEOUT),
        ),
      ]);

      // Aggregate currency transactions
      const currencyMap = new Map<string, { debit: number; credit: number; name: string; code: string }>();

      // Aggregate selling (sales are credit for currency)
      sellingEntries.forEach((e) => {
        const key = e.fromCurrencyId;
        if (!currencyMap.has(key)) {
          currencyMap.set(key, {
            debit: 0,
            credit: 0,
            name: e.fromCurrency?.name || '',
            code: e.fromCurrency?.code || '',
          });
        }
        const entry = currencyMap.get(key)!;
        entry.credit += Number(e.amountCurrency) || 0;
      });

      // Aggregate purchases (purchases are debit for currency)
      purchaseEntries.forEach((e) => {
        const key = e.currencyDrId;
        if (!currencyMap.has(key)) {
          currencyMap.set(key, { debit: 0, credit: 0, name: '', code: '' });
        }
        const entry = currencyMap.get(key)!;
        entry.debit += Number(e.amountCurrency) || 0;
      });

      // Map currency balances
      const currencyBalances: CurrencyBalance[] = Array.from(currencyMap.entries()).map(([id, data]) => ({
        currencyId: id,
        currencyName: data.name,
        currencyCode: data.code,
        totalDebit: Math.round(data.debit * 100) / 100,
        totalCredit: Math.round(data.credit * 100) / 100,
        balance: Math.round((data.credit - data.debit) * 100) / 100,
        lastUpdated: new Date(),
      }));

      // Customer balances
      const customerBalances: CustomerBalance[] = customers.map((c) => ({
        customerId: c.id,
        customerName: c.name,
        contact: c.contact || '',
        email: c.email || '',
        totalDebit: 0,
        totalCredit: 0,
        balance: 0,
        balanceType: 'DEBIT',
      }));

      // Bank balances
      const bankBalances: BankBalance[] = banks.map((b) => ({
        bankId: b.id,
        bankName: b.bankName,
        accountNumber: b.accountNumber || '',
        accountHolder: b.accountHolder || '',
        totalDebit: 0,
        totalCredit: 0,
        balance: 0,
        balanceType: 'DEBIT',
      }));

      // General account balances
      const generalBalances: GeneralAccountBalance[] = generals.map((g) => ({
        accountId: g.id,
        accountName: g.name,
        accountType: g.accountType || 'GENERAL',
        totalDebit: 0,
        totalCredit: 0,
        balance: 0,
        balanceType: 'DEBIT',
      }));

      // Filter out zero-balance entries
      const hasTransactions = (item: any) => item.totalDebit !== 0 || item.totalCredit !== 0;

      // Separate into assets and liabilities and filter out zero-balance entries
      const assetCurrencies = currencyBalances.filter(hasTransactions);
      const assetCustomers = customerBalances.filter((c) => c.balanceType === 'DEBIT' && hasTransactions(c));
      const liabilityCustomers = customerBalances.filter((c) => c.balanceType === 'CREDIT' && hasTransactions(c));
      const assetBanks = bankBalances.filter((b) => b.balanceType === 'CREDIT' && hasTransactions(b));
      const liabilityBanks = bankBalances.filter((b) => b.balanceType === 'DEBIT' && hasTransactions(b));
      const assetGenerals = generalBalances.filter(hasTransactions);
      const liabilityGenerals: GeneralAccountBalance[] = [];

      // Calculate totals efficiently
      const calculateSum = (items: any[], field: string) =>
        items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

      const assetDebit =
        calculateSum(assetCurrencies, 'totalDebit') +
        calculateSum(assetCustomers, 'totalDebit') +
        calculateSum(assetBanks, 'totalDebit') +
        calculateSum(assetGenerals, 'totalDebit');

      const assetCredit =
        calculateSum(assetCurrencies, 'totalCredit') +
        calculateSum(assetCustomers, 'totalCredit') +
        calculateSum(assetBanks, 'totalCredit') +
        calculateSum(assetGenerals, 'totalCredit');

      const liabilityDebit =
        calculateSum(liabilityCustomers, 'totalDebit') +
        calculateSum(liabilityBanks, 'totalDebit') +
        calculateSum(liabilityGenerals, 'totalDebit');

      const liabilityCredit =
        calculateSum(liabilityCustomers, 'totalCredit') +
        calculateSum(liabilityBanks, 'totalCredit') +
        calculateSum(liabilityGenerals, 'totalCredit');

      const totalDebit = assetDebit + liabilityDebit;
      const totalCredit = assetCredit + liabilityCredit;
      const difference = totalDebit - totalCredit;

      const response: BalanceSheetResponse = {
        assets: {
          currencies: assetCurrencies,
          customers: assetCustomers,
          banks: assetBanks,
          generalAccounts: assetGenerals,
        },
        liabilities: {
          currencies: [],
          customers: liabilityCustomers,
          banks: liabilityBanks,
          generalAccounts: liabilityGenerals,
        },
        summary: {
          totalDebit: Math.round(totalDebit * 100) / 100,
          totalCredit: Math.round(totalCredit * 100) / 100,
          difference: Math.round(difference * 100) / 100,
          isBalanced: Math.abs(difference) < 0.01,
          timestamp: new Date(),
        },
        dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined,
      };

      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching balance sheet:`, error);
      if (error.message.includes('took too long')) {
        throw new InternalServerErrorException(
          'Balance sheet report is taking too long. Please try with a smaller date range.',
        );
      }
      throw new InternalServerErrorException(
        'Unable to fetch balance sheet. Please try again later.',
      );
    }
  }

  async getDetailedBalanceSheet(
    adminId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<DetailedBalanceSheetResponse> {
    try {
      const cacheKey = `detailedBalanceSheet:${adminId}:${dateFrom}:${dateTo}`;
      const cached = await this.redisService.getValue(cacheKey);

      if (cached) {
        this.logger.debug(`✅ Detailed Balance Sheet cache HIT`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Detailed Balance Sheet cache MISS - Computing from Transaction Tables`);

      // Build query condition for date range
      const whereCondition = dateFrom && dateTo
        ? { where: { adminId, date: Between(dateFrom, dateTo) } }
        : { where: { adminId } };

      // Optimized parallel queries with selective columns
      const [sellingEntries, purchaseEntries] = await Promise.race<any[]>([
        Promise.all([
          this.sellingEntryRepository.find({
            ...whereCondition,
            select: ['id', 'date', 'sNo', 'amountCurrency', 'fromCurrencyId'],
            relations: ['fromCurrency', 'customerAccount'],
            take: 10000,
          }),
          this.purchaseEntryRepository.find({
            ...whereCondition,
            select: ['id', 'date', 'purchaseNumber', 'amountCurrency', 'currencyDrId'],
            relations: ['customerAccount'],
            take: 10000,
          }),
        ]),
        new Promise<any[]>((_, reject) =>
          setTimeout(
            () => reject(new Error('Detailed balance sheet query took too long')),
            this.QUERY_TIMEOUT,
          ),
        ),
      ]);

      // Aggregate currency transactions into ledger format
      const currencyLedgers = new Map<string, {
        entries: DetailedBalanceSheetEntry[];
        totalDebit: number;
        totalCredit: number;
        currencyName: string;
      }>();

      // Process selling entries
      sellingEntries.forEach((e) => {
        const key = e.fromCurrencyId;
        if (!currencyLedgers.has(key)) {
          currencyLedgers.set(key, {
            entries: [],
            totalDebit: 0,
            totalCredit: 0,
            currencyName: e.fromCurrency?.name || '',
          });
        }
        const ledger = currencyLedgers.get(key)!;
        ledger.entries.push({
          date: e.date,
          entryType: 'SELLING',
          accountName: e.fromCurrency?.name || '',
          narration: `Sale to ${e.customerAccount?.name || 'Customer'}`,
          debit: 0,
          credit: Number(e.amountCurrency) || 0,
          balance: 0,
          reference: e.sNo || '',
        });
        ledger.totalCredit += Number(e.amountCurrency) || 0;
      });

      // Process purchase entries
      purchaseEntries.forEach((e) => {
        const key = e.currencyDrId;
        if (!currencyLedgers.has(key)) {
          currencyLedgers.set(key, {
            entries: [],
            totalDebit: 0,
            totalCredit: 0,
            currencyName: '',
          });
        }
        const ledger = currencyLedgers.get(key)!;
        ledger.entries.push({
          date: e.date,
          entryType: 'PURCHASE',
          accountName: e.customerAccount?.name || '',
          narration: `Purchase from ${e.customerAccount?.name || 'Customer'}`,
          debit: Number(e.amountCurrency) || 0,
          credit: 0,
          balance: 0,
          reference: e.purchaseNumber?.toString() || '',
        });
        ledger.totalDebit += Number(e.amountCurrency) || 0;
      });

      // Build detailed accounts with running balances
      const accounts: DetailedAccountLedger[] = [];

      currencyLedgers.forEach((ledger, currencyId) => {
        // Sort entries by date
        ledger.entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate running balance
        let balance = 0;
        ledger.entries.forEach((entry) => {
          balance = balance + entry.credit - entry.debit;
          entry.balance = Math.round(balance * 100) / 100;
        });

        accounts.push({
          accountId: currencyId,
          accountName: ledger.currencyName || ledger.entries[0]?.accountName || '',
          accountType: 'CURRENCY',
          entries: ledger.entries,
          totalDebit: Math.round(ledger.totalDebit * 100) / 100,
          totalCredit: Math.round(ledger.totalCredit * 100) / 100,
          closingBalance: balance,
        });
      });

      // Filter out zero-balance accounts
      const filteredAccounts = accounts.filter((a) => {
        if (a.accountType === 'CUSTOMER' || a.accountType === 'BANK') {
          const zeroDebit = Math.abs(a.totalDebit) < 0.0001;
          const zeroCredit = Math.abs(a.totalCredit) < 0.0001;
          return !(zeroDebit && zeroCredit);
        }
        return true;
      });

      const totalDebit = filteredAccounts.reduce((sum, a) => sum + a.totalDebit, 0);
      const totalCredit = filteredAccounts.reduce((sum, a) => sum + a.totalCredit, 0);
      const difference = totalDebit - totalCredit;

      const response: DetailedBalanceSheetResponse = {
        accounts: filteredAccounts,
        summary: {
          totalDebit: Math.round(totalDebit * 100) / 100,
          totalCredit: Math.round(totalCredit * 100) / 100,
          difference: Math.round(difference * 100) / 100,
          isBalanced: Math.abs(difference) < 0.01,
          timestamp: new Date(),
        },
        dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined,
      };

      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching detailed balance sheet:`, error);
      if (error.message.includes('took too long')) {
        throw new InternalServerErrorException(
          'Detailed balance sheet report is taking too long. Please try with a smaller date range.',
        );
      }
      throw new InternalServerErrorException(
        'Unable to fetch detailed balance sheet. Please try again later.',
      );
    }
  }

  async getCurrencyIncomeStatement(
    adminId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<CurrencyIncomeStatementResponse> {
    try {
      const cacheKey = `currency:income:statement:${adminId}:${dateFrom?.toISOString() || 'all'}:${dateTo?.toISOString() || 'all'}`;

      // Try to get from cache
      const cached = await this.redisService.getValue(cacheKey);
      if (cached) {
        this.logger.debug(`✅ Currency Income Statement cache HIT`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Currency Income Statement cache MISS`);

      // Build date range filters
      const dateFilter = dateFrom && dateTo ? Between(dateFrom, dateTo) : undefined;

      // Optimized parallel queries with selective columns and aggregation
      const [sellingEntries, purchaseEntries, stockEntries] = await Promise.race<any[]>([
        Promise.all([
          this.sellingEntryRepository
            .createQueryBuilder('se')
            .innerJoin(AddCurrencyEntity, 'c', 'c.id = se.from_currency_id')
            .where('se.adminId = :adminId', { adminId })
            .andWhere(dateFilter ? 'se.date BETWEEN :from AND :to' : '1=1', {
              from: dateFrom,
              to: dateTo,
            })
            .select('se.from_currency_id', 'currencyId')
            .addSelect('c.name', 'currencyName')
            .addSelect('c.code', 'currencyCode')
            .addSelect('SUM(CAST(se.amountCurrency AS DECIMAL))', 'totalUnits')
            .addSelect('SUM(CAST(se.amountPkr AS DECIMAL))', 'totalPkr')
            .addSelect('AVG(CAST(se.rate AS DECIMAL))', 'avgRate')
            .addSelect('COUNT(se.id)', 'transactionCount')
            .addSelect('MAX(se.date)', 'lastDate')
            .groupBy('se.from_currency_id')
            .addGroupBy('c.id')
            .addGroupBy('c.name')
            .addGroupBy('c.code')
            .orderBy('c.name', 'ASC')
            .take(1000)
            .getRawMany(),
          this.purchaseEntryRepository
            .createQueryBuilder('pe')
            .innerJoin(AddCurrencyEntity, 'c', 'c.id = pe.currency_dr_id')
            .where('pe.adminId = :adminId', { adminId })
            .andWhere(dateFilter ? 'pe.date BETWEEN :from AND :to' : '1=1', {
              from: dateFrom,
              to: dateTo,
            })
            .select('pe.currency_dr_id', 'currencyId')
            .addSelect('c.name', 'currencyName')
            .addSelect('c.code', 'currencyCode')
            .addSelect('SUM(CAST(pe.amountCurrency AS DECIMAL))', 'totalUnits')
            .addSelect('SUM(CAST(pe.amountPkr AS DECIMAL))', 'totalPkr')
            .addSelect('AVG(CAST(pe.rate AS DECIMAL))', 'avgRate')
            .addSelect('COUNT(pe.id)', 'transactionCount')
            .addSelect('MAX(pe.date)', 'lastDate')
            .groupBy('pe.currency_dr_id')
            .addGroupBy('c.id')
            .addGroupBy('c.name')
            .addGroupBy('c.code')
            .take(1000)
            .getRawMany(),
          this.currencyStockRepository
            .createQueryBuilder('cs')
            .innerJoin(AddCurrencyEntity, 'c', 'c.id = cs.currency_id')
            .where('cs.adminId = :adminId', { adminId })
            .select('cs.currency_id', 'currencyId')
            .addSelect('c.name', 'currencyName')
            .addSelect('c.code', 'currencyCode')
            .addSelect('CAST(cs.currencyAmount AS DECIMAL)', 'totalUnits')
            .addSelect('CAST(cs.stockAmountPkr AS DECIMAL)', 'totalPkr')
            .addSelect('CAST(cs.rate AS DECIMAL)', 'rate')
            .take(1000)
            .getRawMany(),
        ]),
        new Promise<any[]>((_, reject) =>
          setTimeout(
            () => reject(new Error('Currency income statement query took too long')),
            this.QUERY_TIMEOUT,
          ),
        ),
      ]);

      // Aggregate data into currency map
      const currencyMap = new Map<string, any>();

      // Process selling entries
      sellingEntries.forEach((entry) => {
        if (!currencyMap.has(entry.currencyId)) {
          currencyMap.set(entry.currencyId, {
            currencyId: entry.currencyId,
            currencyName: entry.currencyName,
            currencyCode: entry.currencyCode,
            totalSalesCurrency: 0,
            totalSalesPkr: 0,
            averageSaleRate: 0,
            totalPurchaseCurrency: 0,
            totalPurchasePkr: 0,
            averagePurchaseRate: 0,
            currentStockCurrency: 0,
            currentStockValuePkr: 0,
            currentStockRate: 0,
            totalSalesTransactions: 0,
            totalPurchaseTransactions: 0,
            lastTransactionDate: null,
          });
        }

        const currency = currencyMap.get(entry.currencyId)!;
        currency.totalSalesCurrency = Number(entry.totalUnits) || 0;
        currency.totalSalesPkr = Number(entry.totalPkr) || 0;
        currency.averageSaleRate = Number(entry.avgRate) || 0;
        currency.totalSalesTransactions = Number(entry.transactionCount) || 0;
        currency.lastTransactionDate = entry.lastDate;
      });

      // Process purchase entries
      purchaseEntries.forEach((entry) => {
        if (!currencyMap.has(entry.currencyId)) {
          currencyMap.set(entry.currencyId, {
            currencyId: entry.currencyId,
            currencyName: entry.currencyName,
            currencyCode: entry.currencyCode,
            totalSalesCurrency: 0,
            totalSalesPkr: 0,
            averageSaleRate: 0,
            totalPurchaseCurrency: 0,
            totalPurchasePkr: 0,
            averagePurchaseRate: 0,
            currentStockCurrency: 0,
            currentStockValuePkr: 0,
            currentStockRate: 0,
            totalSalesTransactions: 0,
            totalPurchaseTransactions: 0,
            lastTransactionDate: null,
          });
        }

        const currency = currencyMap.get(entry.currencyId)!;
        currency.totalPurchaseCurrency = Number(entry.totalUnits) || 0;
        currency.totalPurchasePkr = Number(entry.totalPkr) || 0;
        currency.averagePurchaseRate = Number(entry.avgRate) || 0;
        currency.totalPurchaseTransactions = Number(entry.transactionCount) || 0;

        if (!currency.lastTransactionDate || new Date(entry.lastDate) > currency.lastTransactionDate) {
          currency.lastTransactionDate = entry.lastDate;
        }
      });

      // Process stock entries
      stockEntries.forEach((entry) => {
        if (!currencyMap.has(entry.currencyId)) {
          currencyMap.set(entry.currencyId, {
            currencyId: entry.currencyId,
            currencyName: entry.currencyName,
            currencyCode: entry.currencyCode,
            totalSalesCurrency: 0,
            totalSalesPkr: 0,
            averageSaleRate: 0,
            totalPurchaseCurrency: 0,
            totalPurchasePkr: 0,
            averagePurchaseRate: 0,
            currentStockCurrency: 0,
            currentStockValuePkr: 0,
            currentStockRate: 0,
            totalSalesTransactions: 0,
            totalPurchaseTransactions: 0,
            lastTransactionDate: null,
          });
        }

        const currency = currencyMap.get(entry.currencyId)!;
        currency.currentStockCurrency = Number(entry.totalUnits) || 0;
        currency.currentStockValuePkr = Number(entry.totalPkr) || 0;
        currency.currentStockRate = Number(entry.rate) || 0;
      });

      // Calculate P&L for each currency
      let totalRevenue = 0;
      let totalCost = 0;
      let totalGrossProfit = 0;

      const currencies = Array.from(currencyMap.values()).map((currency) => {
        const grossProfit = currency.totalSalesPkr - currency.totalPurchasePkr;
        const grossMargin = currency.totalSalesPkr > 0 ? (grossProfit / currency.totalSalesPkr) * 100 : 0;

        totalRevenue += currency.totalSalesPkr;
        totalCost += currency.totalPurchasePkr;
        totalGrossProfit += grossProfit;

        return {
          ...currency,
          grossProfit: Math.round(grossProfit * 100) / 100,
          grossProfitMargin: Math.round(grossMargin * 100) / 100,
          netProfit: Math.round(grossProfit * 100) / 100,
          netProfitMargin: Math.round(grossMargin * 100) / 100,
        };
      });

      // Build summary
      const summary: CurrencyIncomeStatementSummary = {
        totalRevenuePkr: Math.round(totalRevenue * 100) / 100,
        totalCostPkr: Math.round(totalCost * 100) / 100,
        totalGrossProfitPkr: Math.round(totalGrossProfit * 100) / 100,
        totalNetProfitPkr: Math.round(totalGrossProfit * 100) / 100,
        overallGrossMargin:
          totalRevenue > 0 ? Math.round((totalGrossProfit / totalRevenue) * 10000) / 100 : 0,
        overallNetMargin:
          totalRevenue > 0 ? Math.round((totalGrossProfit / totalRevenue) * 10000) / 100 : 0,
        totalCurrencies: currencies.length,
        totalSalesTransactions: currencies.reduce(
          (sum, c) => sum + c.totalSalesTransactions,
          0,
        ),
        totalPurchaseTransactions: currencies.reduce(
          (sum, c) => sum + c.totalPurchaseTransactions,
          0,
        ),
        dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined,
        timestamp: new Date(),
      };

      const response: CurrencyIncomeStatementResponse = {
        currencies,
        summary,
      };

      // Cache the result
      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching currency income statement:`, error);
      if (error.message.includes('took too long')) {
        throw new InternalServerErrorException(
          'Currency income statement is taking too long. Please try with a smaller date range.',
        );
      }
      throw new InternalServerErrorException(
        'Unable to fetch currency income statement. Please try again later.',
      );
    }
  }

  async getCustomerCurrencyPurchaseReport(
    adminId: string,
    customerId: string,
    currencyId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<{
    customer: { id: string; name: string; contact: string; email: string };
    currency: { id: string; name: string; code: string };
    purchases: Array<{
      id: string;
      purchaseNumber: number;
      date: Date;
      amountCurrency: number;
      amountPkr: number;
      rate: number;
    }>;
    summary: {
      totalTransactions: number;
      totalAmountCurrency: number;
      totalAmountPkr: number;
      averageRate: number;
      dateRange?: { from: Date; to: Date };
    };
  }> {
    try {
      // Validate required parameters
      if (!customerId) {
        throw new BadRequestException('Customer ID is required.');
      }
      if (!currencyId) {
        throw new BadRequestException('Currency ID is required.');
      }

      // Build cache key
      const cacheKey = `customerCurrencyPurchase:${adminId}:${customerId}:${currencyId}:${dateFrom?.toISOString() || 'all'}:${dateTo?.toISOString() || 'all'}`;
      
      // Check cache
      const cached = await this.redisService.getValue(cacheKey);
      if (cached) {
        this.logger.debug(`✅ Customer Currency Purchase Report cache HIT`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Customer Currency Purchase Report cache MISS`);

      // Build query with date range filter
      const queryBuilder = this.purchaseEntryRepository
        .createQueryBuilder('pe')
        .leftJoin('pe.customerAccount', 'customer')
        .leftJoin(AddCurrencyEntity, 'currency', 'currency.id = pe.currency_dr_id')
        .where('pe.adminId = :adminId', { adminId })
        .andWhere('pe.customer_account_id = :customerId', { customerId })
        .andWhere('pe.currency_dr_id = :currencyId', { currencyId });

      // Add date range if provided
      if (dateFrom && dateTo) {
        queryBuilder.andWhere('pe.date BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
      }

      // Execute query with timeout
      const [purchaseEntries, customer, currency] = await Promise.race<any[]>([
        Promise.all([
          queryBuilder
            .select([
              'pe.id',
              'pe.purchaseNumber',
              'pe.date',
              'pe.amountCurrency',
              'pe.amountPkr',
              'pe.rate',
            ])
            .addSelect(['customer.id', 'customer.name', 'customer.contact', 'customer.email'])
            .addSelect(['currency.id', 'currency.name', 'currency.code'])
            .orderBy('pe.date', 'DESC')
            .addOrderBy('pe.purchaseNumber', 'DESC')
            .take(5000)
            .getMany(),
          this.customerAccountRepository.findOne({
            where: { id: customerId, adminId },
            select: ['id', 'name', 'contact', 'email'],
          }),
          this.currencyRepository.findOne({
            where: { id: currencyId },
            select: ['id', 'name', 'code'],
          }),
        ]),
        new Promise<any[]>((_, reject) =>
          setTimeout(
            () => reject(new Error('Customer currency purchase report query took too long')),
            this.QUERY_TIMEOUT,
          ),
        ),
      ]);

      // Validate customer exists
      if (!customer) {
        throw new BadRequestException('Customer not found.');
      }

      // Map purchase entries
      const purchases = purchaseEntries.map((entry) => ({
        id: entry.id,
        purchaseNumber: entry.purchaseNumber || 0,
        date: entry.date,
        amountCurrency: Number(entry.amountCurrency) || 0,
        amountPkr: Number(entry.amountPkr) || 0,
        rate: Number(entry.rate) || 0,
      }));

      // Calculate summary
      const totalTransactions = purchases.length;
      const totalAmountCurrency = purchases.reduce((sum, p) => sum + p.amountCurrency, 0);
      const totalAmountPkr = purchases.reduce((sum, p) => sum + p.amountPkr, 0);
      const averageRate = totalAmountCurrency > 0 ? totalAmountPkr / totalAmountCurrency : 0;

      const response = {
        customer: {
          id: customer.id,
          name: customer.name,
          contact: customer.contact || '',
          email: customer.email || '',
        },
        currency: {
          id: currencyId,
          name: currency?.name || 'Unknown',
          code: currency?.code || '',
        },
        purchases,
        summary: {
          totalTransactions,
          totalAmountCurrency: Math.round(totalAmountCurrency * 100) / 100,
          totalAmountPkr: Math.round(totalAmountPkr * 100) / 100,
          averageRate: Math.round(averageRate * 100) / 100,
          dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined,
        },
      };

      // Cache the result
      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);

      return response;
    } catch (error) {
      this.logger.error(`Error fetching customer currency purchase report:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.message.includes('took too long')) {
        throw new InternalServerErrorException(
          'Customer currency purchase report is taking too long. Please try with a smaller date range.',
        );
      }
      throw new InternalServerErrorException(
        'Unable to fetch customer currency purchase report. Please try again later.',
      );
    }
  }

  async getCustomerCurrencySaleReport(
    adminId: string,
    customerId: string,
    currencyId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<{
    customer: { id: string; name: string; contact: string; email: string };
    currency: { id: string; name: string; code: string };
    sales: Array<{
      id: string;
      sNo: number;
      date: Date;
      amountCurrency: number;
      amountPkr: number;
      rate: number;
      pl: number;
    }>;
    summary: {
      totalTransactions: number;
      totalAmountCurrency: number;
      totalAmountPkr: number;
      averageRate: number;
      totalPl: number;
      dateRange?: { from: Date; to: Date };
    };
    accounts: {
      customers: Array<{ id: string; name: string; contact: string; email: string }>;
      currencies: Array<{ id: string; name: string; code: string }>;
      banks: Array<{ id: string; bankName: string; accountNumber: string; accountHolder: string }>;
      generals: Array<{ id: string; name: string; accountType: string }>;
    };
  }> {
    try {
      if (!customerId) {
        throw new BadRequestException('Customer ID is required.');
      }
      if (!currencyId) {
        throw new BadRequestException('Currency ID is required.');
      }

      const cacheKey = `customerCurrencySales:${adminId}:${customerId}:${currencyId}:${dateFrom?.toISOString() || 'all'}:${dateTo?.toISOString() || 'all'}`;

      const cached = await this.redisService.getValue(cacheKey);
      if (cached) {
        this.logger.debug(`✅ Customer Currency Sale Report cache HIT`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Customer Currency Sale Report cache MISS`);

      // Build query
      const qb = this.sellingEntryRepository
        .createQueryBuilder('s')
        .leftJoin('s.customerAccount', 'customer')
        .leftJoin(AddCurrencyEntity, 'currency', 'currency.id = s.from_currency_id')
        .where('s.adminId = :adminId', { adminId })
        .andWhere('s.customer_account_id = :customerId', { customerId })
        .andWhere('s.from_currency_id = :currencyId', { currencyId });

      if (dateFrom && dateTo) {
        qb.andWhere('s.date BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
      }

      const [sellingEntries, customer, currency, customers, currencies, banks, generals] = await Promise.race<any[]>([
        Promise.all([
          qb
            .select([
              's.id',
              's.sNo',
              's.date',
              's.amountCurrency',
              's.amountPkr',
              's.rate',
              's.pl',
            ])
            .addSelect(['customer.id', 'customer.name', 'customer.contact', 'customer.email'])
            .addSelect(['currency.id', 'currency.name', 'currency.code'])
            .orderBy('s.date', 'DESC')
            .addOrderBy('s.sNo', 'DESC')
            .take(5000)
            .getMany(),
          this.customerAccountRepository.findOne({
            where: { id: customerId, adminId },
            select: ['id', 'name', 'contact', 'email'],
          }),
          this.currencyRepository.findOne({
            where: { id: currencyId },
            select: ['id', 'name', 'code'],
          }),
          this.customerAccountRepository.find({
            where: { adminId },
            select: ['id', 'name', 'contact', 'email'],
            take: 1000,
          }),
          this.currencyRepository.find({
            // Some currency tables may have admin scoping; include if present
            select: ['id', 'name', 'code'],
            take: 1000,
          }),
          this.bankAccountRepository.find({
            where: { adminId },
            select: ['id', 'bankName', 'accountNumber', 'accountHolder'],
            take: 1000,
          }),
          this.generalAccountRepository.find({
            where: { adminId },
            select: ['id', 'name', 'accountType'],
            take: 1000,
          }),
        ]),
        new Promise<any[]>((_, reject) =>
          setTimeout(
            () => reject(new Error('Customer currency sale report query took too long')),
            this.QUERY_TIMEOUT,
          ),
        ),
      ]);

      if (!customer) {
        throw new BadRequestException('Customer not found.');
      }

      const sales = sellingEntries.map((e) => ({
        id: e.id,
        sNo: e.sNo || 0,
        date: e.date,
        amountCurrency: Number(e.amountCurrency) || 0,
        amountPkr: Number(e.amountPkr) || 0,
        rate: Number(e.rate) || 0,
        pl: Number(e.pl) || 0,
      }));

      const totalTransactions = sales.length;
      const totalAmountCurrency = sales.reduce((sum, s) => sum + s.amountCurrency, 0);
      const totalAmountPkr = sales.reduce((sum, s) => sum + s.amountPkr, 0);
      const averageRate = totalAmountCurrency > 0 ? totalAmountPkr / totalAmountCurrency : 0;
      const totalPl = sales.reduce((sum, s) => sum + s.pl, 0);

      const response = {
        customer: {
          id: customer.id,
          name: customer.name,
          contact: customer.contact || '',
          email: customer.email || '',
        },
        currency: {
          id: currencyId,
          name: currency?.name || 'Unknown',
          code: currency?.code || '',
        },
        sales,
        summary: {
          totalTransactions,
          totalAmountCurrency: Math.round(totalAmountCurrency * 100) / 100,
          totalAmountPkr: Math.round(totalAmountPkr * 100) / 100,
          averageRate: Math.round(averageRate * 100) / 100,
          totalPl: Math.round(totalPl * 100) / 100,
          dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined,
        },
        accounts: {
          customers,
          currencies,
          banks,
          generals,
        },
      };

      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching customer currency sale report:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.message.includes('took too long')) {
        throw new InternalServerErrorException(
          'Customer currency sale report is taking too long. Please try with a smaller date range.',
        );
      }
      throw new InternalServerErrorException(
        'Unable to fetch customer currency sale report. Please try again later.',
      );
    }
  }

  /**
   * Get Currency Ledger Report from General Ledger with Pagination
   * Groups data by date and calculates running balance and average rate
   * Uses AccountBalanceEntity for pre-calculated balance data
   */
  async getCurrencyLedger(
    adminId: string,
    currencyId: string,
    page: number = 1,
    limit: number = 10,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<CurrencyLedgerResponse> {
    try {
      if (!currencyId) {
        throw new BadRequestException('Currency ID is required');
      }

      // Build cache key
      const cacheKey = `currencyLedger:${adminId}:${currencyId}:${page}:${limit}:${dateFrom || 'all'}:${dateTo || 'all'}`;
      const cached = await this.redisService.getValue(cacheKey);
      
      if (cached) {
        this.logger.debug(`✅ Currency Ledger cache HIT`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Currency Ledger cache MISS`);

      // Get currency details
      const currency = await this.currencyRepository.findOne({
        where: { id: currencyId },
      });

      if (!currency) {
        throw new BadRequestException('Currency not found');
      }

      // Get account balance for this currency from AccountBalanceEntity
      const accountBalance = await this.accountBalanceRepository.findOne({
        where: {
          adminId,
          accountId: currencyId,
          accountType: 'CURRENCY',
        },
      });

      // Build query for general ledger
      const queryBuilder = this.generalLedgerRepository
        .createQueryBuilder('gl')
        .where('gl.adminId = :adminId', { adminId })
        .andWhere('gl.accountId = :currencyId', { currencyId })
        .andWhere('gl.accountType = :accountType', { accountType: 'CURRENCY' })
        .orderBy('gl.transactionDate', 'ASC')
        .addOrderBy('gl.createdAt', 'ASC');

      // Apply date filters if provided
      if (dateFrom) {
        queryBuilder.andWhere('gl.transactionDate >= :dateFrom', { dateFrom });
      }
      if (dateTo) {
        queryBuilder.andWhere('gl.transactionDate <= :dateTo', { dateTo });
      }

      // Get total count for pagination
      const totalRecords = await queryBuilder.getCount();
      const totalPages = Math.ceil(totalRecords / limit);

      // Get paginated results
      const ledgerEntries = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      // Process entries and group by date
      const groupedByDate: Map<string, CurrencyLedgerEntry[]> = new Map();
      let runningBalance = accountBalance ? Number(accountBalance.balance) : 0;
      let totalDirhamAmount = 0;
      let totalRateSum = 0;
      let rateCount = 0;

      ledgerEntries.forEach((entry) => {
        const dateKey = this.toISODateString(entry.transactionDate);
        
        // Calculate running balance (Debit increases, Credit decreases for currency)
        runningBalance += (entry.debitAmount || 0) - (entry.creditAmount || 0);
        
        // Calculate total dirham balance
        totalDirhamAmount += (entry.currencyAmount || 0);
        
        // Sum exchange rates for average calculation
        if (entry.exchangeRate && entry.exchangeRate > 0) {
          totalRateSum += entry.exchangeRate;
          rateCount++;
        }

        const ledgerEntry: CurrencyLedgerEntry = {
          id: entry.id,
          transactionDate: dateKey,
          entryType: entry.entryType,
          referenceNumber: entry.referenceNumber || '',
          description: entry.description || '',
          debit: entry.debitAmount || 0,
          credit: entry.creditAmount || 0,
          currencyAmount: entry.currencyAmount || 0,
          exchangeRate: entry.exchangeRate || 0,
          contraAccountName: entry.contraAccountName || '',
          runningBalance: Math.round(runningBalance * 100) / 100,
        };

        if (!groupedByDate.has(dateKey)) {
          groupedByDate.set(dateKey, []);
        }
        groupedByDate.get(dateKey)!.push(ledgerEntry);
      });

      // Build response data grouped by date
      const data: CurrencyLedgerByDate[] = Array.from(groupedByDate.entries()).map(([date, entries]) => {
        const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
        const closingBalance = entries[entries.length - 1]?.runningBalance || 0;

        return {
          date,
          entries,
          totalDebit: Math.round(totalDebit * 100) / 100,
          totalCredit: Math.round(totalCredit * 100) / 100,
          closingBalance: Math.round(closingBalance * 100) / 100,
        };
      });

      // Calculate average rate from all ledger entries
      const avgRate = rateCount > 0 ? Math.round((totalRateSum / rateCount) * 100) / 100 : 0;

      // Use account balance for total balance if no ledger entries in the filtered date range
      const finalBalance = ledgerEntries.length > 0 
        ? Math.round(runningBalance * 100) / 100 
        : (accountBalance ? Math.round(Number(accountBalance.balance) * 100) / 100 : 0);

      const response: CurrencyLedgerResponse = {
        currencyId: currency.id,
        currencyName: currency.name,
        currencyCode: currency.code,
        data,
        totalDirhamBalance: Math.round(totalDirhamAmount * 100) / 100,
        currentBalance: finalBalance,
        avgRate,
        pagination: {
          page,
          limit,
          totalPages,
          totalRecords,
        },
      };

      // Cache the response
      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      
      return response;
    } catch (error) {
      this.logger.error(`Error fetching currency ledger:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to fetch currency ledger. Please try again later.',
      );
    }
  }

  /**
   * Get Account Ledger for any account type (Customer, Bank, Currency, General)
   * Returns all transactions with running balance and comprehensive totals
   */
  async getAccountLedger(
    adminId: string,
    accountId: string,
    page: number = 1,
    limit: number = 50,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<AccountLedgerResponse> {
    try {
      if (!accountId) {
        throw new BadRequestException('Account ID is required');
      }

      // Build cache key
      const cacheKey = `accountLedger:${adminId}:${accountId}:${page}:${limit}:${dateFrom || 'all'}:${dateTo || 'all'}`;
      const cached = await this.redisService.getValue(cacheKey);
      
      if (cached) {
        this.logger.debug(`✅ Account Ledger cache HIT`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Account Ledger cache MISS`);

      // Find account in various account tables to determine type and name
      let accountName = '';
      let accountType: 'CUSTOMER' | 'BANK' | 'CURRENCY' | 'GENERAL' = 'CUSTOMER';
      let accountFound = false;

      // Try Customer Account
      const customerAccount = await this.customerAccountRepository.findOne({
        where: { id: accountId, adminId },
      });

      if (customerAccount) {
        accountName = customerAccount.name;
        accountType = 'CUSTOMER';
        accountFound = true;
      } else {
        // Try Bank Account
        const bankAccount = await this.bankAccountRepository.findOne({
          where: { id: accountId, adminId },
        });

        if (bankAccount) {
          accountName = bankAccount.bankName;
          accountType = 'BANK';
          accountFound = true;
        } else {
          // Try Currency Account
          const currencyAccount = await this.currencyRepository.findOne({
            where: { id: accountId, adminId },
          });

          if (currencyAccount) {
            accountName = currencyAccount.name;
            accountType = 'CURRENCY';
            accountFound = true;
          } else {
            // Try General Account
            const generalAccount = await this.generalAccountRepository.findOne({
              where: { id: accountId, adminId },
            });

            if (generalAccount) {
              accountName = generalAccount.name;
              accountType = 'GENERAL';
              accountFound = true;
            } else {
              // Try to get from general ledger (as fallback for any account type)
              const firstEntry = await this.generalLedgerRepository.findOne({
                where: { accountId, adminId },
                order: { transactionDate: 'ASC' },
              });

              if (firstEntry) {
                accountName = firstEntry.accountName;
                accountType = firstEntry.accountType;
                accountFound = true;
              }
            }
          }
        }
      }

      if (!accountFound) {
        throw new BadRequestException('Account not found');
      }

      // Build query for general ledger
      const queryBuilder = this.generalLedgerRepository
        .createQueryBuilder('gl')
        .where('gl.adminId = :adminId', { adminId })
        .andWhere('gl.accountId = :accountId', { accountId })
        .orderBy('gl.transactionDate', 'ASC')
        .addOrderBy('gl.createdAt', 'ASC');

      // Apply date filters if provided
      if (dateFrom) {
        queryBuilder.andWhere('gl.transactionDate >= :dateFrom', { dateFrom });
      }
      if (dateTo) {
        queryBuilder.andWhere('gl.transactionDate <= :dateTo', { dateTo });
      }

      // Get total count for pagination
      const totalRecords = await queryBuilder.getCount();
      const totalPages = Math.ceil(totalRecords / limit);

      // Get paginated results
      const ledgerEntries = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      // Process entries and calculate running balance
      let runningBalance = 0;
      let totalCredit = 0;
      let totalDebit = 0;
      let totalChqInward = 0;
      let totalChqOutward = 0;
      // If we're on page 1 and no date filter, start from 0
      // Otherwise, get the balance up to the start of this page
      if (page > 1 || dateFrom) {
        const previousQuery = this.generalLedgerRepository
          .createQueryBuilder('gl')
          .select('COALESCE(SUM(gl.debitAmount), 0) - COALESCE(SUM(gl.creditAmount), 0)', 'balance')
          .where('gl.adminId = :adminId', { adminId })
          .andWhere('gl.accountId = :accountId', { accountId });

        if (dateFrom && page === 1) {
          previousQuery.andWhere('gl.transactionDate < :dateFrom', { dateFrom });
        } else if (page > 1) {
          const skipCount = (page - 1) * limit;
          const previousEntries = await this.generalLedgerRepository
            .createQueryBuilder('gl')
            .where('gl.adminId = :adminId', { adminId })
            .andWhere('gl.accountId = :accountId', { accountId })
            .orderBy('gl.transactionDate', 'ASC')
            .addOrderBy('gl.createdAt', 'ASC')
            .take(skipCount)
            .getMany();

          previousEntries.forEach(entry => {
            runningBalance += (entry.debitAmount || 0) - (entry.creditAmount || 0);
          });
        }
      }

      const entries: AccountLedgerEntry[] = ledgerEntries.map((entry) => {
        const debit = entry.debitAmount || 0;
        const credit = entry.creditAmount || 0;

        runningBalance += debit - credit;

        totalDebit += debit;
        totalCredit += credit;

        if (entry.entryType === 'CHQ_INWARD') {
          totalChqInward += debit || credit;
        } else if (entry.entryType === 'CHQ_OUTWARD') {
          totalChqOutward += debit || credit;
        }

        return {
          date: this.toISODateString(entry.transactionDate),
          number: entry.referenceNumber || entry.id.substring(0, 8),
          paymentType: this.formatPaymentType(entry.entryType),
          narration: entry.description || entry.contraAccountName || '',
          debit: Math.round(debit * 100) / 100,
          credit: Math.round(credit * 100) / 100,
          balance: Math.round(runningBalance * 100) / 100,
          referenceNumber: entry.referenceNumber,
        };
      });

      const balance = Math.round(runningBalance * 100) / 100;
      const total = Math.round((totalDebit + totalCredit) * 100) / 100;

      const totals: AccountLedgerTotals = {
        totalCredit: Math.round(totalCredit * 100) / 100,
        totalDebit: Math.round(totalDebit * 100) / 100,
        totalChqInward: Math.round(totalChqInward * 100) / 100,
        totalChqOutward: Math.round(totalChqOutward * 100) / 100,
        balance,
        total,
      };

      const response: AccountLedgerResponse = {
        accountId,
        accountName,
        accountType,
        entries,
        totals,
        pagination: {
          page,
          limit,
          totalPages,
          totalRecords,
        },
      };

      // Cache the response
      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);
      
      return response;
    } catch (error) {
      this.logger.error(`Error fetching account ledger:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to fetch account ledger. Please try again later.',
      );
    }
  }

  /**
   * Format payment type for display
   */
  private formatPaymentType(entryType: string): string {
    const typeMap: Record<string, string> = {
      'SALE': 'Sale',
      'PURCHASE': 'Purchase',
      'JOURNAL': 'Journal Entry',
      'BANK_PAYMENT': 'Bank Payment',
      'BANK_RECEIPT': 'Bank Receipt',
      'CASH_PAYMENT': 'Cash Payment',
      'CASH_RECEIPT': 'Cash Receipt',
      'CHQ_INWARD': 'Cheque Inward',
      'CHQ_OUTWARD': 'Cheque Outward',
      'CURRENCY_ENTRY': 'Currency Entry',
      'CURRENCY_JOURNAL': 'Currency Journal',
    };
    return typeMap[entryType] || entryType;
  }

}