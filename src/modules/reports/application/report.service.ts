// All Reports Service With Redis and High Scalabilty and Perfomace
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerCurrencyEntryEntity } from 'src/modules/currency/domain/entities/currency-entry.entity';
import { PurchaseEntryEntity } from 'src/modules/sale-purchase/domain/entity/purchase_entries.entity';
import { SellingEntryEntity } from 'src/modules/sale-purchase/domain/entity/selling_entries.entity';
import { RedisService } from 'src/shared/modules/redis/redis.service';
import { Between, Repository } from 'typeorm';
import { CurrencyStockEntity } from 'src/modules/currency/domain/entities/currency-stock.entity';
import { AddCurrencyEntity } from 'src/modules/account/domain/entity/currency.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(SellingEntryEntity)
    private readonly sellingEntryRepository: Repository<SellingEntryEntity>,

    @InjectRepository(PurchaseEntryEntity)
    private readonly purchaseEntryRepository: Repository<PurchaseEntryEntity>,

    @InjectRepository(CustomerCurrencyEntryEntity)
    private readonly currencyEntryRepository: Repository<CustomerCurrencyEntryEntity>,

    @InjectRepository(CurrencyStockEntity)
    private readonly currencyStockRepository: Repository<CurrencyStockEntity>,

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
    const rows = await this.currencyStockRepository
      .createQueryBuilder('cs')
      .innerJoin(AddCurrencyEntity, 'c', 'c.id = cs.currencyId')
      .where('cs.adminId = :adminId', { adminId })
      .andWhere('cs.currencyAmount > 0')
      .select('c.name', 'name')
      .addSelect('c.code', 'code')
      .addSelect('cs.stockAmountPkr', 'amountPkr')
      .addSelect('cs.currencyAmount', 'amountCurrency')
      .addSelect('cs.rate', 'rate')
      .orderBy('c.name', 'ASC')
      .getRawMany();

    const items = rows.map((r) => ({
      name: r.name,
      code: r.code,
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

    return { items, totals };
  }

  async dailyBooksReport(adminId: string, date: string): Promise<any> {
    const cacheKey = `dailyBooksReport:${adminId}:${date}`;
    // const cached = await this.redisService.getValue(cacheKey);

    // if (cached) {
    //   console.log('✅ Daily Books Report cache HIT');
    //   return cached;
    // }

    console.log('🛑 Daily Books Report cache MISS');
    const dateObj = new Date(date);
    const [sellingEntries, purchaseEntries, currencyEntries] =
      await Promise.all([
        this.sellingEntryRepository.find({
          where: { adminId, date: dateObj },
        }),
        this.purchaseEntryRepository.find({
          where: { adminId, date: dateObj },
        }),
        this.currencyEntryRepository.find({
          where: { adminId, date: dateObj },
        }),
      ]);
    const response = {
      sellingEntries,
      purchaseEntries,
      currencyEntries,
    };

    await this.redisService.deleteKey(cacheKey);
    return response;
  }

  async dailyBuyingReport(adminId: string, date: string): Promise<any> {
    const cacheKey = `dailyBuyingReport:${adminId}:${date}`;
    const cached = await this.redisService.getValue(cacheKey);
    if (cached) {
      console.log('✅ Daily Buying Report cache HIT');
      return cached;
    }
    console.log('🛑 Daily Buying Report cache MISS');
    const dateObj = new Date(date);
    const purchaseEntries = await this.purchaseEntryRepository.find({
      where: { adminId, date: dateObj },
    });
    await this.redisService.setValue(cacheKey, purchaseEntries, 3600);
    //Return Customer Name Currency Account and Amount Rate and Amount PKR
    const response = purchaseEntries.map((entry) => ({
      customerName: entry.customerAccount.name,
      currencyAccount: entry.currencyDrId,
      S_No: entry.purchaseNumber,
      amount: entry.amountCurrency,
      rate: entry.rate,
      amountPKR: entry.amountPkr,
    }));
    return {
      entry: response,
      totalCurrencyAmount: purchaseEntries.reduce(
        (sum, entry) => sum + entry.amountCurrency,
        0,
      ),
      totalPkrAmount: purchaseEntries.reduce(
        (sum, entry) => sum + entry.amountPkr,
        0,
      ),
    };
  }

  async dailySellingReport(adminId: string, date: string): Promise<any> {
    const cacheKey = `dailySellingReport:${adminId}:${date}`;
    const cached = await this.redisService.getValue(cacheKey);

    if (cached) {
      console.log('✅ Daily Selling Report cache HIT');
      return cached;
    }

    console.log('🛑 Daily Selling Report cache MISS');

    // ---------------- SELLING (LIST + TOTALS) ----------------
    const sellingQuery = this.sellingEntryRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.customerAccount', 'customer')
      .leftJoinAndSelect('s.fromCurrency', 'currency')
      .where('s.adminId = :adminId', { adminId })
      .andWhere('s.date = :date', { date });

    const [sellingEntries, sellingTotals] = await Promise.all([
      sellingQuery.getMany(),
      sellingQuery
        .select([
          'SUM(s.amountCurrency) as totalCurrency',
          'SUM(s.amountPkr) as totalPkr',
          'SUM(s.pl) as totalPl',
        ])
        .getRawOne(),
    ]);

    // ---------------- PURCHASE (TOTALS ONLY) ----------------
    const purchaseTotals = await this.purchaseEntryRepository
      .createQueryBuilder('p')
      .where('p.adminId = :adminId', { adminId })
      .andWhere('p.date = :date', { date })
      .select([
        'SUM(p.amountCurrency) as totalCurrency',
        'SUM(p.amountPkr) as totalPkr',
      ])
      .getRawOne();

    // ---------------- RESPONSE FORMAT ----------------
    const sellingList = sellingEntries.map((entry) => ({
      customerName: entry.customerAccount.name,
      currencyAccount: entry.fromCurrency.name,
      S_No: entry.sNo,
      amount: entry.amountCurrency,
      rate: entry.rate,
      amountPKR: entry.amountPkr,
      pl: entry.pl,
    }));

    const buyingPkr = Number(purchaseTotals?.totalPkr || 0);
    const sellingPkr = Number(sellingTotals?.totalPkr || 0);

    const response = {
      entry: sellingList,

      grandTotal: {
        buying: {
          amount: Number(purchaseTotals?.totalCurrency || 0),
          pkr: buyingPkr,
          pnl: 0,
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
    };

    await this.redisService.setValue(cacheKey, response, 3600);
    return response;
  }

  async dailySellingReportByCurrency(
    adminId: string,
    date: string,
  ): Promise<any> {
    const cacheKey = `dailySellingReport:${adminId}:${date}`;
    const cached = await this.redisService.getValue(cacheKey);

    if (cached) {
      console.log('✅ Daily Selling Report cache HIT');
      return cached;
    }

    console.log('🛑 Daily Selling Report cache MISS');

    const sellingQuery = this.sellingEntryRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.customerAccount', 'customer')
      .leftJoinAndSelect('s.fromCurrency', 'currency')
      .where('s.adminId = :adminId', { adminId })
      .andWhere('s.date = :date', { date });

    const [sellingEntries, sellingTotals] = await Promise.all([
      sellingQuery.getMany(),
      sellingQuery
        .select([
          'SUM(s.amountCurrency) as totalCurrency',
          'SUM(s.amountPkr) as totalPkr',
          'SUM(s.pl) as totalPl',
        ])
        .getRawOne(),
    ]);

    const sellingList = sellingEntries.map((entry) => ({
      customerName: entry.customerAccount.name,
      currencyAccount: entry.fromCurrency.name,
      S_No: entry.sNo,
      amount: entry.amountCurrency,
      rate: entry.rate,
      amountPKR: entry.amountPkr,
      pl: entry.pl,
    }));

    const sellingPkr = Number(sellingTotals?.totalPkr || 0);

    const response = {
      entry: sellingList,

      grandTotal: {
        selling: {
          amount: Number(sellingTotals?.totalCurrency || 0),
          pkr: sellingPkr,
        },
      },
    };

    await this.redisService.setValue(cacheKey, response, 3600);
    return response;
  }

  async ledgersCurrencyReport(
    adminId: string,
    dateFrom?: string,
    dateTo?: string,
    currencyId?: string,
  ): Promise<any> {
    // const cacheKey = `ledgersCurrencyReport:${adminId}:${dateFrom}:${dateTo}:${currencyId}`;
    // const cached = await this.redisService.getValue(cacheKey);
    // if (cached) {
    //   console.log('✅ Ledgers Currency Report cache HIT');
    //   return cached;
    // }

    // console.log('🛑 Ledgers Currency Report cache MISS');

    /* ================= SELLING ================= */

    const sellingQB = this.sellingEntryRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.customerAccount', 'customer')
      .where('s.adminId = :adminId', { adminId })
      .andWhere('s.fromCurrencyId = :currencyId', { currencyId });

    if (dateFrom && dateTo) {
      sellingQB.andWhere('DATE(s.date) BETWEEN :from AND :to', {
        from: dateFrom,
        to: dateTo,
      });
    }

    const sellingEntries = await sellingQB.getMany();

    /* ================= PURCHASE ================= */
    const purchaseQB = this.purchaseEntryRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.customerAccount', 'customer')
      .where('p.adminId = :adminId', { adminId })
      .andWhere('p.currencyDrId = :currencyId', { currencyId });

    if (dateFrom && dateTo) {
      purchaseQB.andWhere('DATE(p.date) BETWEEN :from AND :to', {
        from: dateFrom,
        to: dateTo,
      });
    }

    const purchaseEntries = await purchaseQB.getMany();

    /* ================= NORMALIZE ================= */
    const rows = [
      ...sellingEntries.map((e) => ({
        date: e.date.toISOString().split('T')[0],
        orderNo: e.sNo,
        narration: `${e.customerAccount?.name} DH A/C`,
        dr: 0,
        cr: e.amountCurrency,
      })),
      ...purchaseEntries.map((e) => ({
        date: e.date.toISOString().split('T')[0],
        orderNo: e.purchaseNumber,
        narration: `${e.customerAccount?.name} DH A/C`,
        dr: e.amountCurrency,
        cr: 0,
      })),
    ];

    rows.sort((a, b) => a.date.localeCompare(b.date));

    let balance = 0;
    const grouped = rows.reduce(
      (acc, row) => {
        if (!acc[row.date]) acc[row.date] = [];
        balance += row.cr - row.dr;
        acc[row.date].push({ ...row, balance });
        return acc;
      },
      {} as Record<string, any[]>,
    );

    const response = Object.entries(grouped).map(([date, entries]) => ({
      date,
      entries,
    }));

    // await this.redisService.setValue(cacheKey, response, 3600);
    return response;
  }

}
