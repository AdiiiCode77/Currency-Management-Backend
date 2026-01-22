import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { RedisService } from '../../../shared/modules/redis/redis.service';
import { SellingEntryEntity } from '../../sale-purchase/domain/entity/selling_entries.entity';
import { PurchaseEntryEntity } from '../../sale-purchase/domain/entity/purchase_entries.entity';
import { CustomerAccountEntity } from '../../account/domain/entity/customer-account.entity';
import { BankAccountEntity } from '../../account/domain/entity/bank-account.entity';
import { CurrencyStockEntity } from '../../currency/domain/entities/currency-stock.entity';
import { AddCurrencyEntity } from '../../account/domain/entity/currency.entity';
import { ChqInwardEntryEntity } from '../domain/entity/chq-inward-entry.entity';
import { ChqOutwardEntryEntity } from '../domain/entity/chq-outward-entry.entity';
import { AccountBalanceEntity } from '../../journal/domain/entity/account-balance.entity';
import {
  CardStatsDto,
  DashboardGraphsDto,
  DashboardStatsResponseDto,
  DailySalesChartDataDto,
  CurrencyDistributionDto,
  TopCustomerDto,
  MonthlyRevenueDto,
  TransactionTypeDistributionDto,
  ProfitTrendDto,
} from '../domain/dto/dashboard-stats.dto';

@Injectable()
export class DashboardStatsService {
  private readonly logger = new Logger(DashboardStatsService.name);
  private readonly CACHE_DURATION = 300; // 5 minutes for dashboard data
  private readonly QUERY_TIMEOUT = 30000;

  constructor(
    @InjectRepository(SellingEntryEntity)
    private readonly sellingEntryRepository: Repository<SellingEntryEntity>,

    @InjectRepository(PurchaseEntryEntity)
    private readonly purchaseEntryRepository: Repository<PurchaseEntryEntity>,

    @InjectRepository(CustomerAccountEntity)
    private readonly customerAccountRepository: Repository<CustomerAccountEntity>,

    @InjectRepository(BankAccountEntity)
    private readonly bankAccountRepository: Repository<BankAccountEntity>,

    @InjectRepository(CurrencyStockEntity)
    private readonly currencyStockRepository: Repository<CurrencyStockEntity>,

    @InjectRepository(AddCurrencyEntity)
    private readonly currencyRepository: Repository<AddCurrencyEntity>,

    @InjectRepository(ChqInwardEntryEntity)
    private readonly chqInwardRepository: Repository<ChqInwardEntryEntity>,

    @InjectRepository(ChqOutwardEntryEntity)
    private readonly chqOutwardRepository: Repository<ChqOutwardEntryEntity>,

    @InjectRepository(AccountBalanceEntity)
    private readonly accountBalanceRepository: Repository<AccountBalanceEntity>,

    private readonly redisService: RedisService,
  ) {}

  /**
   * Get complete dashboard statistics including cards and graphs
   */
  async getDashboardStats(adminId: string): Promise<DashboardStatsResponseDto> {
    try {
      const cacheKey = `dashboardStats:${adminId}`;
      const cached = await this.redisService.getValue(cacheKey);

      if (cached) {
        this.logger.debug(`✅ Dashboard Stats cache HIT`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      this.logger.debug(`🛑 Dashboard Stats cache MISS`);

      // Fetch both card stats and graphs in parallel
      const [cardStats, graphs] = await Promise.all([
        this.getCardStats(adminId),
        this.getGraphsData(adminId),
      ]);

      const response: DashboardStatsResponseDto = {
        cardStats,
        graphs,
        timestamp: new Date(),
      };

      // Cache the response
      await this.redisService.setValue(cacheKey, JSON.stringify(response), this.CACHE_DURATION);

      return response;
    } catch (error) {
      this.logger.error(`Error fetching dashboard stats:`, error);
      throw new InternalServerErrorException(
        'Unable to fetch dashboard statistics. Please try again later.',
      );
    }
  }

  /**
   * Get card statistics for dashboard
   */
  async getCardStats(adminId: string): Promise<CardStatsDto> {
    try {
      const cacheKey = `dashboardCardStats:${adminId}`;
      const cached = await this.redisService.getValue(cacheKey);

      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      // Get all required data in parallel
      const [
        totalSalesData,
        totalPurchaseData,
        todaySalesData,
        todayPurchasesData,
        customerCount,
        currencyStockValue,
        bankBalances,
        pendingChqInward,
        pendingChqOutward,
      ] = await Promise.race<any[]>([
        Promise.all([
          // Total sales
          this.sellingEntryRepository
            .createQueryBuilder('s')
            .where('s.adminId = :adminId', { adminId })
            .select('COALESCE(SUM(CAST(s.amountPkr AS DECIMAL)), 0)', 'totalPkr')
            .addSelect('COALESCE(SUM(CAST(s.pl AS DECIMAL)), 0)', 'totalProfit')
            .getRawOne(),

          // Total purchases
          this.purchaseEntryRepository
            .createQueryBuilder('p')
            .where('p.adminId = :adminId', { adminId })
            .select('COALESCE(SUM(CAST(p.amountPkr AS DECIMAL)), 0)', 'totalPkr')
            .getRawOne(),

          // Today's sales
          this.sellingEntryRepository
            .createQueryBuilder('s')
            .where('s.adminId = :adminId', { adminId })
            .andWhere('s.date >= :today', { today })
            .andWhere('s.date <= :todayEnd', { todayEnd })
            .select('COALESCE(SUM(CAST(s.amountPkr AS DECIMAL)), 0)', 'totalPkr')
            .addSelect('COUNT(s.id)', 'count')
            .getRawOne(),

          // Today's purchases
          this.purchaseEntryRepository
            .createQueryBuilder('p')
            .where('p.adminId = :adminId', { adminId })
            .andWhere('p.date >= :today', { today })
            .andWhere('p.date <= :todayEnd', { todayEnd })
            .select('COALESCE(SUM(CAST(p.amountPkr AS DECIMAL)), 0)', 'totalPkr')
            .addSelect('COUNT(p.id)', 'count')
            .getRawOne(),

          // Active customers count
          this.customerAccountRepository.count({
            where: { adminId },
          }),

          // Currency stock value
          this.currencyStockRepository
            .createQueryBuilder('cs')
            .where('cs.adminId = :adminId', { adminId })
            .select('COALESCE(SUM(CAST(cs.stockAmountPkr AS DECIMAL)), 0)', 'totalStockValue')
            .getRawOne(),

          // Bank balances
          this.accountBalanceRepository
            .createQueryBuilder('ab')
            .where('ab.adminId = :adminId', { adminId })
            .andWhere('ab.accountType = :accountType', { accountType: 'BANK' })
            .select('COALESCE(SUM(CAST(ab.balance AS DECIMAL)), 0)', 'totalBankBalance')
            .getRawOne(),

          // Pending cheque inward
          this.chqInwardRepository.count({
            where: { adminId },
          }),

          // Pending cheque outward
          this.chqOutwardRepository.count({
            where: { adminId },
          }),
        ]),
        new Promise<any[]>((_, reject) =>
          setTimeout(() => reject(new Error('Card stats query took too long')), this.QUERY_TIMEOUT),
        ),
      ]);

      const totalRevenue = Number(totalSalesData?.totalPkr || 0);
      const totalCost = Number(totalPurchaseData?.totalPkr || 0);
      const totalProfit = Number(totalSalesData?.totalProfit || 0);
      const todaySales = Number(todaySalesData?.totalPkr || 0);
      const todayPurchases = Number(todayPurchasesData?.totalPkr || 0);
      const todayTransactions = (Number(todaySalesData?.count || 0) + Number(todayPurchasesData?.count || 0));
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      const cardStats: CardStatsDto = {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        todayTransactions,
        activeCustomers: customerCount,
        currencyStockValue: Math.round(Number(currencyStockValue?.totalStockValue || 0) * 100) / 100,
        totalBankBalance: Math.round(Number(bankBalances?.totalBankBalance || 0) * 100) / 100,
        todaySales: Math.round(todaySales * 100) / 100,
        todayPurchases: Math.round(todayPurchases * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        pendingCheques: pendingChqInward + pendingChqOutward,
      };

      await this.redisService.setValue(cacheKey, JSON.stringify(cardStats), this.CACHE_DURATION);

      return cardStats;
    } catch (error) {
      this.logger.error(`Error fetching card stats:`, error);
      throw new InternalServerErrorException('Unable to fetch card statistics.');
    }
  }

  /**
   * Get graphs data for dashboard
   */
  async getGraphsData(adminId: string): Promise<DashboardGraphsDto> {
    try {
      const cacheKey = `dashboardGraphs:${adminId}`;
      const cached = await this.redisService.getValue(cacheKey);

      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }

      // Fetch all graph data in parallel
      const [
        dailySalesChart,
        currencyDistribution,
        topCustomers,
        monthlyRevenue,
        transactionTypeDistribution,
        profitTrend,
      ] = await Promise.all([
        this.getDailySalesChart(adminId),
        this.getCurrencyDistribution(adminId),
        this.getTopCustomers(adminId),
        this.getMonthlyRevenue(adminId),
        this.getTransactionTypeDistribution(adminId),
        this.getProfitTrend(adminId),
      ]);

      const graphs: DashboardGraphsDto = {
        dailySalesChart,
        currencyDistribution,
        topCustomers,
        monthlyRevenue,
        transactionTypeDistribution,
        profitTrend,
      };

      await this.redisService.setValue(cacheKey, JSON.stringify(graphs), this.CACHE_DURATION);

      return graphs;
    } catch (error) {
      this.logger.error(`Error fetching graphs data:`, error);
      throw new InternalServerErrorException('Unable to fetch graph data.');
    }
  }

  /**
   * Get daily sales vs purchases chart data (last 30 days)
   */
  private async getDailySalesChart(adminId: string): Promise<DailySalesChartDataDto[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [salesByDay, purchasesByDay] = await Promise.all([
      this.sellingEntryRepository
        .createQueryBuilder('s')
        .where('s.adminId = :adminId', { adminId })
        .andWhere('s.date >= :startDate', { startDate: thirtyDaysAgo })
        .select('DATE(s.date)', 'date')
        .addSelect('COALESCE(SUM(CAST(s.amountPkr AS DECIMAL)), 0)', 'sales')
        .addSelect('COALESCE(SUM(CAST(s.pl AS DECIMAL)), 0)', 'profit')
        .groupBy('DATE(s.date)')
        .orderBy('DATE(s.date)', 'ASC')
        .getRawMany(),

      this.purchaseEntryRepository
        .createQueryBuilder('p')
        .where('p.adminId = :adminId', { adminId })
        .andWhere('p.date >= :startDate', { startDate: thirtyDaysAgo })
        .select('DATE(p.date)', 'date')
        .addSelect('COALESCE(SUM(CAST(p.amountPkr AS DECIMAL)), 0)', 'purchases')
        .groupBy('DATE(p.date)')
        .orderBy('DATE(p.date)', 'ASC')
        .getRawMany(),
    ]);

    // Merge sales and purchases by date
    const dataMap = new Map<string, DailySalesChartDataDto>();

    salesByDay.forEach((item) => {
      const date = this.formatDate(item.date);
      dataMap.set(date, {
        date,
        sales: Math.round(Number(item.sales) * 100) / 100,
        purchases: 0,
        profit: Math.round(Number(item.profit) * 100) / 100,
      });
    });

    purchasesByDay.forEach((item) => {
      const date = this.formatDate(item.date);
      if (dataMap.has(date)) {
        dataMap.get(date)!.purchases = Math.round(Number(item.purchases) * 100) / 100;
      } else {
        dataMap.set(date, {
          date,
          sales: 0,
          purchases: Math.round(Number(item.purchases) * 100) / 100,
          profit: 0,
        });
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get currency-wise sales distribution
   */
  private async getCurrencyDistribution(adminId: string): Promise<CurrencyDistributionDto[]> {
    const currencyData = await this.sellingEntryRepository
      .createQueryBuilder('s')
      .innerJoin(AddCurrencyEntity, 'c', 'c.id = s.from_currency_id')
      .where('s.adminId = :adminId', { adminId })
      .select('s.from_currency_id', 'currencyId')
      .addSelect('c.name', 'currencyName')
      .addSelect('c.code', 'currencyCode')
      .addSelect('COALESCE(SUM(CAST(s.amountCurrency AS DECIMAL)), 0)', 'amount')
      .addSelect('COALESCE(SUM(CAST(s.amountPkr AS DECIMAL)), 0)', 'valuePkr')
      .groupBy('s.from_currency_id')
      .addGroupBy('c.name')
      .addGroupBy('c.code')
      .orderBy('"valuePkr"', 'DESC')
      .limit(10)
      .getRawMany();

    const totalValue = currencyData.reduce((sum, item) => sum + Number(item.valuePkr), 0);

    return currencyData.map((item) => ({
      currencyCode: item.currencyCode || '',
      currencyName: item.currencyName || '',
      amount: Math.round(Number(item.amount) * 100) / 100,
      valuePkr: Math.round(Number(item.valuePkr) * 100) / 100,
      percentage: totalValue > 0 ? Math.round((Number(item.valuePkr) / totalValue) * 10000) / 100 : 0,
    }));
  }

  /**
   * Get top 10 customers by transaction volume
   */
  private async getTopCustomers(adminId: string): Promise<TopCustomerDto[]> {
    const topCustomers = await this.sellingEntryRepository
      .createQueryBuilder('s')
      .innerJoin(CustomerAccountEntity, 'c', 'c.id = s.customer_account_id')
      .where('s.adminId = :adminId', { adminId })
      .select('s.customer_account_id', 'customerId')
      .addSelect('c.name', 'customerName')
      .addSelect('COALESCE(SUM(CAST(s.amountPkr AS DECIMAL)), 0)', 'totalValue')
      .addSelect('COUNT(s.id)', 'transactionCount')
      .groupBy('s.customer_account_id')
      .addGroupBy('c.name')
      .orderBy('"totalValue"', 'DESC')
      .limit(10)
      .getRawMany();

    return topCustomers.map((item) => ({
      customerId: item.customerId,
      customerName: item.customerName || 'Unknown',
      totalValue: Math.round(Number(item.totalValue) * 100) / 100,
      transactionCount: Number(item.transactionCount),
    }));
  }

  /**
   * Get monthly revenue comparison (last 12 months)
   */
  private async getMonthlyRevenue(adminId: string): Promise<MonthlyRevenueDto[]> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [monthlySales, monthlyPurchases] = await Promise.all([
      this.sellingEntryRepository
        .createQueryBuilder('s')
        .where('s.adminId = :adminId', { adminId })
        .andWhere('s.date >= :startDate', { startDate: twelveMonthsAgo })
        .select('EXTRACT(YEAR FROM s.date)', 'year')
        .addSelect('EXTRACT(MONTH FROM s.date)', 'month')
        .addSelect('COALESCE(SUM(CAST(s.amountPkr AS DECIMAL)), 0)', 'revenue')
        .addSelect('COALESCE(SUM(CAST(s.pl AS DECIMAL)), 0)', 'profit')
        .groupBy('EXTRACT(YEAR FROM s.date)')
        .addGroupBy('EXTRACT(MONTH FROM s.date)')
        .orderBy('EXTRACT(YEAR FROM s.date)', 'ASC')
        .addOrderBy('EXTRACT(MONTH FROM s.date)', 'ASC')
        .getRawMany(),

      this.purchaseEntryRepository
        .createQueryBuilder('p')
        .where('p.adminId = :adminId', { adminId })
        .andWhere('p.date >= :startDate', { startDate: twelveMonthsAgo })
        .select('EXTRACT(YEAR FROM p.date)', 'year')
        .addSelect('EXTRACT(MONTH FROM p.date)', 'month')
        .addSelect('COALESCE(SUM(CAST(p.amountPkr AS DECIMAL)), 0)', 'cost')
        .groupBy('EXTRACT(YEAR FROM p.date)')
        .addGroupBy('EXTRACT(MONTH FROM p.date)')
        .orderBy('EXTRACT(YEAR FROM p.date)', 'ASC')
        .addOrderBy('EXTRACT(MONTH FROM p.date)', 'ASC')
        .getRawMany(),
    ]);

    // Merge data by month
    const monthMap = new Map<string, MonthlyRevenueDto>();

    monthlySales.forEach((item) => {
      const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
      const monthName = this.getMonthName(item.month, item.year);
      monthMap.set(monthKey, {
        month: monthName,
        revenue: Math.round(Number(item.revenue) * 100) / 100,
        cost: 0,
        profit: Math.round(Number(item.profit) * 100) / 100,
      });
    });

    monthlyPurchases.forEach((item) => {
      const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
      const monthName = this.getMonthName(item.month, item.year);
      if (monthMap.has(monthKey)) {
        monthMap.get(monthKey)!.cost = Math.round(Number(item.cost) * 100) / 100;
      } else {
        monthMap.set(monthKey, {
          month: monthName,
          revenue: 0,
          cost: Math.round(Number(item.cost) * 100) / 100,
          profit: 0,
        });
      }
    });

    return Array.from(monthMap.values());
  }

  /**
   * Get transaction type distribution
   */
  private async getTransactionTypeDistribution(adminId: string): Promise<TransactionTypeDistributionDto[]> {
    const [salesCount, purchaseCount] = await Promise.all([
      this.sellingEntryRepository
        .createQueryBuilder('s')
        .where('s.adminId = :adminId', { adminId })
        .select('COUNT(s.id)', 'count')
        .addSelect('COALESCE(SUM(CAST(s.amountPkr AS DECIMAL)), 0)', 'totalValue')
        .getRawOne(),

      this.purchaseEntryRepository
        .createQueryBuilder('p')
        .where('p.adminId = :adminId', { adminId })
        .select('COUNT(p.id)', 'count')
        .addSelect('COALESCE(SUM(CAST(p.amountPkr AS DECIMAL)), 0)', 'totalValue')
        .getRawOne(),
    ]);

    const totalCount = Number(salesCount?.count || 0) + Number(purchaseCount?.count || 0);
    const totalValue = Number(salesCount?.totalValue || 0) + Number(purchaseCount?.totalValue || 0);

    const distribution: TransactionTypeDistributionDto[] = [
      {
        type: 'SALE',
        count: Number(salesCount?.count || 0),
        totalValue: Math.round(Number(salesCount?.totalValue || 0) * 100) / 100,
        percentage: totalCount > 0 ? Math.round((Number(salesCount?.count || 0) / totalCount) * 10000) / 100 : 0,
      },
      {
        type: 'PURCHASE',
        count: Number(purchaseCount?.count || 0),
        totalValue: Math.round(Number(purchaseCount?.totalValue || 0) * 100) / 100,
        percentage: totalCount > 0 ? Math.round((Number(purchaseCount?.count || 0) / totalCount) * 10000) / 100 : 0,
      },
    ];

    return distribution;
  }

  /**
   * Get profit/loss trend (last 30 days)
   */
  private async getProfitTrend(adminId: string): Promise<ProfitTrendDto[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const profitByDay = await this.sellingEntryRepository
      .createQueryBuilder('s')
      .where('s.adminId = :adminId', { adminId })
      .andWhere('s.date >= :startDate', { startDate: thirtyDaysAgo })
      .select('DATE(s.date)', 'date')
      .addSelect('COALESCE(SUM(CAST(s.pl AS DECIMAL)), 0)', 'profit')
      .groupBy('DATE(s.date)')
      .orderBy('DATE(s.date)', 'ASC')
      .getRawMany();

    // Calculate average profit for target line
    const avgProfit = profitByDay.length > 0
      ? profitByDay.reduce((sum, item) => sum + Number(item.profit), 0) / profitByDay.length
      : 0;

    return profitByDay.map((item) => ({
      date: this.formatDate(item.date),
      profit: Math.round(Number(item.profit) * 100) / 100,
      target: Math.round(avgProfit * 100) / 100,
    }));
  }

  /**
   * Helper: Format date to YYYY-MM-DD
   */
  private formatDate(date: any): string {
    if (!date) return '';
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return String(date).substring(0, 10);
      return d.toISOString().split('T')[0];
    } catch {
      return String(date).substring(0, 10);
    }
  }

  /**
   * Helper: Get month name with year
   */
  private getMonthName(month: number, year: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${months[month - 1]} ${year}`;
  }
}
