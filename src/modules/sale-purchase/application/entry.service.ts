import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PurchaseEntryEntity } from '../domain/entity/purchase_entries.entity';
import { SellingEntryEntity } from '../domain/entity/selling_entries.entity';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
import { BankAccountEntity } from 'src/modules/account/domain/entity/bank-account.entity';
import { CreatePurchaseDto } from '../domain/dto/purchase-create.dto';
import { CreateSellingDto } from '../domain/dto/selling-create.dto';
import { AddCurrencyEntity } from 'src/modules/account/domain/entity/currency.entity';
import { UserEntity } from 'src/modules/users/domain/entities/user.entity';
import { AdminEntity } from 'src/modules/users/domain/entities/admin.entity';
import { UserProfileEntity } from 'src/modules/users/domain/entities/user-profiles.entity';
import { CurrencyRelationEntity } from '../domain/entity/currencyRelation.entity';
import { CurrencyPnlPreviewDto } from '../domain/dto/CurrencyPnlPreview.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisService } from 'src/shared/modules/redis/redis.service';
import { CurrencyStockEntity } from 'src/modules/currency/domain/entities/currency-stock.entity';
import { CustomerCurrencyAccountEntity } from 'src/modules/currency/domain/entities/currencies-account.entity';
import { AccountBalanceEntity } from 'src/modules/journal/domain/entity/account-balance.entity';
import { AccountLedgerEntity } from 'src/modules/journal/domain/entity/account-ledger.entity';

@Injectable()
export class SalePurchaseService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(PurchaseEntryEntity)
    private purchaseRepo: Repository<PurchaseEntryEntity>,

    @InjectRepository(SellingEntryEntity)
    private sellingRepo: Repository<SellingEntryEntity>,

    @InjectRepository(AddCurrencyEntity)
    private currencyRepo: Repository<AddCurrencyEntity>,

    @InjectRepository(CustomerAccountEntity)
    private customerRepo: Repository<CustomerAccountEntity>,

    @InjectRepository(BankAccountEntity)
    private bankRepo: Repository<BankAccountEntity>,

    @InjectRepository(CustomerCurrencyAccountEntity)
    private currencyAccountRepo: Repository<CustomerCurrencyAccountEntity>,

    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,

    @InjectRepository(AdminEntity)
    private adminRepo: Repository<AdminEntity>,

    @InjectRepository(UserProfileEntity)
    private userProfileRepo: Repository<UserProfileEntity>,

    @InjectRepository(CurrencyRelationEntity)
    private readonly currency_relation: Repository<CurrencyRelationEntity>,

    @InjectRepository(AccountBalanceEntity)
    private readonly accountBalanceRepo: Repository<AccountBalanceEntity>,

    @InjectRepository(AccountLedgerEntity)
    private readonly accountLedgerRepo: Repository<AccountLedgerEntity>,

    private readonly dataSource: DataSource,

    private readonly redisService: RedisService,
  ) {}

  private async updateCurrencyStock(
    manager: EntityManager,
    adminId: string,
    currencyId: string,
  ) {
    const balances = await manager
      .createQueryBuilder(CurrencyRelationEntity, 'cr')
      .select('SUM(cr.balance)', 'totalCurrency')
      .addSelect('SUM(cr.balancePkr)', 'totalPkr')
      .where('cr.currencyId = :currencyId', { currencyId })
      .andWhere('cr.adminId = :adminId', { adminId })
      .getRawOne();

    const totalCurrency = +balances?.totalCurrency || 0;
    const totalPkr = +balances?.totalPkr || 0;

    const avgRateResult = await manager
      .createQueryBuilder(SellingEntryEntity, 's')
      .select('AVG(s.rate)', 'avgRate')
      .where('s.adminId = :adminId', { adminId })
      .andWhere('s.fromCurrencyId = :currencyId', { currencyId })
      .getRawOne();

    const rate = +avgRateResult?.avgRate || 0;

    const existing = await manager.findOne(CurrencyStockEntity, {
      where: { adminId, currencyId },
    });

    if (existing) {
      await manager.update(CurrencyStockEntity, { id: existing.id }, {
        stockAmountPkr: totalPkr,
        currencyAmount: totalCurrency,
        rate,
      });
    } else {
      const entity = manager.create(CurrencyStockEntity, {
        adminId,
        currencyId,
        stockAmountPkr: totalPkr,
        currencyAmount: totalCurrency,
        rate,
      });
      await manager.save(entity);
    }

    return { totalPkr, totalCurrency, rate };
  }

  async getCurrencyPnlPreview(adminId: string, dto: CurrencyPnlPreviewDto) {
    const { currencyId, amountCurrency, sellingRate } = dto;

    const balances = await this.currency_relation
      .createQueryBuilder('cr')
      .select('SUM(cr.balance)', 'totalCurrency')
      .addSelect('SUM(cr.balancePkr)', 'totalPkr')
      .where('cr.currencyId = :currencyId', { currencyId })
      .andWhere('cr.adminId = :adminId', { adminId })
      .getRawOne();

    const totalCurrency = +balances?.totalCurrency || 0;
    const totalPkr = +balances?.totalPkr || 0;

    if (totalCurrency <= 0) {
      throw new BadRequestException('No currency balance available');
    }

    if (amountCurrency > totalCurrency) {
      throw new BadRequestException('Insufficient currency balance');
    }

    const avgRate = totalPkr / totalCurrency;
    const costPkr = amountCurrency * avgRate;
    const salePkr = amountCurrency * sellingRate;
    const pnl = salePkr - costPkr;
    const margin = (pnl / costPkr) * 100;

    return {
      costPkr: +costPkr.toFixed(2),
      salePkr: +salePkr.toFixed(2),
      pnl: +pnl.toFixed(2),
      margin: +margin.toFixed(4),
    };
  }

  async getCurrencyData(
    adminId: string,
    id: string,
    code: 'sale' | 'purchase',
  ) {
    const cacheKey = `currency-dropdown:${adminId}:${id}:${code}`;
    console.log('🔍 Checking cache for key:', cacheKey);

    // Check Redis cache first
    const cached = await this.redisService.getValue<{
      totalPkr: number;
      totalCurrency: number;
      AvgRate: number;
      S_NO: string;
    }>(cacheKey);

    if (cached) {
      console.log('✅ Cache HIT – returning cached currency data');
      return cached;
    }

    console.log('❌ Cache MISS – fetching from DB');

    const [currency, balances, avgRateResult] = await Promise.all([
      this.currencyRepo.findOne({
        where: { id },
        select: ['id', 'code'],
      }),
      this.currency_relation
        .createQueryBuilder('cr')
        .select('SUM(cr.balance)', 'totalCurrency')
        .addSelect('SUM(cr.balancePkr)', 'totalPkr')
        .where('cr.currencyId = :currencyId', { currencyId: id })
        .andWhere('cr.adminId = :adminId', { adminId })
        .getRawOne(),
      this.sellingRepo
        .createQueryBuilder('s')
        .select('AVG(s.rate)', 'avgRate')
        .where('s.adminId = :adminId', { adminId })
        .getRawOne(),
    ]);

    if (!currency) {
      throw new BadRequestException('Currency Not Exists');
    }

    const totalCurrency = +balances?.totalCurrency || 0;
    const totalPkr = +balances?.totalPkr || 0;
    const AvgRate = +avgRateResult?.avgRate || 0;

    const prefix = code === 'sale' ? 'S' : 'P';

    const lastRecord =
      code === 'sale'
        ? await this.sellingRepo
            .createQueryBuilder('s')
            .select('s.saleNumber', 'number')
            .where('s.adminId = :adminId', { adminId })
            .orderBy('s.saleNumber', 'DESC')
            .limit(1)
            .getRawOne<{ number: number }>()
        : await this.purchaseRepo
            .createQueryBuilder('p')
            .select('p.purchaseNumber', 'number')
            .where('p.adminId = :adminId', { adminId })
            .orderBy('p.purchaseNumber', 'DESC')
            .limit(1)
            .getRawOne<{ number: number }>();

    const nextNumber = lastRecord?.number ? lastRecord.number + 1 : 1;

    const response = {
      totalPkr,
      totalCurrency,
      AvgRate,
      S_NO: `${currency.code}-${prefix}-${nextNumber}`,
    };

    // Cache in Redis for 30 seconds
    await this.redisService.setValue(cacheKey, response, 30);
    console.log('💾 Cache SET for key:', cacheKey);

    return response;
  }

  async updateCurrencyRelation(
    manager: EntityManager,
    params: {
      userId: string;
      adminId: string;
      currencyId: string;
      amountCurrency: number;
      amountPkr: number;
      type: 'PURCHASE' | 'SELL';
    },
  ) {
    const relation = await manager.findOne(CurrencyRelationEntity, {
      where: {
        userId: params.userId,
        adminId: params.adminId,
        currencyId: params.currencyId,
      },
    });

    const sign = params.type === 'PURCHASE' ? 1 : -1;

    if (!relation) {
      if (params.type === 'SELL') {
        throw new BadRequestException(
          'Insufficient currency balance (no relation found)',
        );
      }

      const newRelation = manager.create(CurrencyRelationEntity, {
        userId: params.userId,
        adminId: params.adminId,
        currencyId: params.currencyId,
        balance: params.amountCurrency,
        balancePkr: params.amountPkr,
      });

      return manager.save(newRelation);
    }

    const newBalance =
      Number(relation.balance) + sign * Number(params.amountCurrency);

    const newBalancePkr =
      Number(relation.balancePkr) + sign * Number(params.amountPkr);

    if (newBalance < 0) {
      throw new BadRequestException('Insufficient currency balance');
    }

    await manager.update(
      CurrencyRelationEntity,
      { id: relation.id },
      {
        balance: newBalance,
        balancePkr: newBalancePkr,
      },
    );

    return {
      ...relation,
      balance: newBalance,
      balancePkr: newBalancePkr,
    };
  }

  getPkrAmount(AmountCurrenct: number, Rate: number) {
    return {
      amountPkr: AmountCurrenct * Rate,
    };
  }

  /**
   * Validate that the account ID exists in at least one of the three account types
   * @param accountId - The account ID to validate
   * @param adminId - Admin ID for filtering
   * @returns Account object with type information
   */
  private async validateAccountExists(
    accountId: string,
    adminId: string,
  ): Promise<{ found: boolean; type?: 'customer' | 'bank' | 'currency' }> {
    try {
      // Check customer accounts
      const customerAccount = await this.customerRepo.findOne({
        where: { id: accountId, adminId },
      });

      if (customerAccount) {
        return { found: true, type: 'customer' };
      }

      // Check bank accounts
      const bankAccount = await this.bankRepo.findOne({
        where: { id: accountId, adminId },
      });

      if (bankAccount) {
        return { found: true, type: 'bank' };
      }

      // Check currency accounts
      const currencyAccount = await this.currencyAccountRepo.findOne({
        where: { id: accountId, adminId },
      });

      if (currencyAccount) {
        return { found: true, type: 'currency' };
      }

      return { found: false };
    } catch (error) {
      console.error('Error validating account:', error);
      throw new BadRequestException('Error validating account');
    }
  }

  /**
   * Update account balance for customer, bank, or currency accounts
   * Recalculates totals from purchases and sales
   * @param accountId - The account ID to update
   * @param adminId - Admin ID for filtering
   * @param accountType - Type of account (customer, bank, currency)
   */
  private async updateAccountBalance(
    accountId: string,
    adminId: string,
    accountType: 'customer' | 'bank' | 'currency',
  ): Promise<void> {
    try {
      let totalDebit = 0;
      let totalCredit = 0;
      let accountName = '';
      let accountMetadata = '';

      if (accountType === 'customer') {
        const account = await this.customerRepo.findOne({
          where: { id: accountId, adminId },
        });
        if (!account) return;

        accountName = account.name;
        accountMetadata = account.contact || '';

        // Get purchases (debit - money paid to supplier/customer)
        const purchases = await this.purchaseRepo
          .createQueryBuilder('p')
          .where('p.customerAccountId = :accountId', { accountId })
          .andWhere('p.adminId = :adminId', { adminId })
          .select('SUM(p.amountPkr)', 'total')
          .getRawOne();
        totalCredit += Number(purchases?.total || 0);

        // Get sales (credit - money received from customer)
        const sales = await this.sellingRepo
          .createQueryBuilder('s')
          .where('s.customerAccountId = :accountId', { accountId })
          .andWhere('s.adminId = :adminId', { adminId })
          .select('SUM(s.amountPkr)', 'total')
          .getRawOne();
        totalDebit += Number(sales?.total || 0);
      } else if (accountType === 'bank') {
        const account = await this.bankRepo.findOne({
          where: { id: accountId, adminId },
        });
        if (!account) return;

        accountName = account.bankName;
        accountMetadata = account.accountNumber || '';

        // Similar calculation for bank accounts if needed
        // Add logic here based on your requirements
      } else if (accountType === 'currency') {
        const account = await this.currencyAccountRepo.findOne({
          where: { id: accountId, adminId },
          relations: ['currency'],
        });
        if (!account) return;

        accountName = account.name;
        accountMetadata = account.currency?.code || '';

        // Similar calculation for currency accounts if needed
        // Add logic here based on your requirements
      }

      const balance = totalCredit - totalDebit;

      // Update or create balance record
      await this.accountBalanceRepo.upsert(
        {
          adminId,
          accountId: accountId,
          accountType: accountType.toUpperCase() as 'CUSTOMER' | 'BANK' | 'CURRENCY',
          accountName,
          accountMetadata,
          totalDebit,
          totalCredit,
          balance: Math.abs(balance),
          balanceType: balance >= 0 ? 'CREDIT' : 'DEBIT',
          lastEntryDate: new Date(),
        },
        ['adminId', 'accountId', 'accountType'],
      );

      console.log(
        `✅ Updated ${accountType} account balance for ${accountName}`,
      );
    } catch (error) {
      console.error(`Error updating ${accountType} account balance:`, error);
      // Don't throw - balance update is supplementary
    }
  }

  async createPurchase(dto: CreatePurchaseDto, adminId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const adminData = await this.adminRepo
        .createQueryBuilder('a')
        .leftJoin('user_profiles', 'up', 'up.id = a.user_profile_id')
        .leftJoin('users', 'u', 'u.id = up.user_id')
        .where('a.id = :adminId', { adminId })
        .select(['a.id AS admin_id', 'up.id AS up_id', 'u.id AS u_id'])
        .getRawOne();

      if (!adminData) throw new NotFoundException('Admin not found');
      if (!adminData.up_id)
        throw new NotFoundException('User profile not found');
      if (!adminData.u_id) throw new NotFoundException('User not found');

      const userId = adminData.u_id;

      // Validate the account exists in one of three types
      const accountValidation = await this.validateAccountExists(
        dto.customerAccountId,
        adminId,
      );

      if (!accountValidation.found) {
        throw new BadRequestException(
          `Account with ID "${dto.customerAccountId}" not found. Please select a valid customer, bank, or currency account.`,
        );
      }

      // 2. Fetch currency + customer
      const [currency, customer] = await Promise.all([
        manager.findOneBy(AddCurrencyEntity, { id: dto.currencyDrId }),
        manager.findOneBy(CustomerAccountEntity, { id: dto.customerAccountId }),
      ]);

      if (!currency)
        throw new NotFoundException('Currency DR Account not found');
      if (!customer) throw new NotFoundException('Customer Account not found');

      const entry = manager.create(PurchaseEntryEntity, {
        date: dto.date,
        manualRef: dto.manualRef,
        amountCurrency: dto.amountCurrency,
        rate: dto.rate,
        amountPkr: dto.amountPkr,
        description: dto.description,
        currencyDrId: currency.id,
        customerAccountId: dto.customerAccountId,
        customerAccount: customer,
        adminId,
      });

      const relation = await manager.findOneBy(CurrencyRelationEntity, {
        userId,
        adminId,
        currencyId: currency.id,
      });

      if (!relation) {
        await manager.insert(CurrencyRelationEntity, {
          userId,
          adminId,
          currencyId: currency.id,
          balance: dto.amountCurrency,
          balancePkr: dto.amountPkr,
        });
      } else {
        await manager.update(
          CurrencyRelationEntity,
          { id: relation.id },
          {
            balance: Number(relation.balance) + Number(dto.amountCurrency),
            balancePkr: Number(relation.balancePkr) + Number(dto.amountPkr),
          },
        );
      }

      await manager.save(PurchaseEntryEntity, entry);

      await this.updateCurrencyStock(manager, adminId, currency.id);

      const redis = this.redisService.getClient();

      await redis.del(`dailyBooksReport:${adminId}:${dto.date}`);

      await redis.del(`dailyBuyingReport:${adminId}:${dto.date}`);

      // Update account balance for the customer/bank/currency account
      if (accountValidation.type) {
        await this.updateAccountBalance(
          dto.customerAccountId,
          adminId,
          accountValidation.type,
        );
      }

      return entry;
    });
  }

  async createSelling(dto: CreateSellingDto, adminId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const adminData = await this.adminRepo
        .createQueryBuilder('a')
        .leftJoin('user_profiles', 'up', 'up.id = a.user_profile_id')
        .leftJoin('users', 'u', 'u.id = up.user_id')
        .where('a.id = :adminId', { adminId })
        .select(['a.id AS admin_id', 'up.id AS up_id', 'u.id AS u_id'])
        .getRawOne();

      if (!adminData) throw new NotFoundException('Admin not found');
      if (!adminData.up_id)
        throw new NotFoundException('User profile not found');
      if (!adminData.u_id) throw new NotFoundException('User not found');

      const userId = adminData.u_id;

      // Validate the account exists in one of three types
      const accountValidation = await this.validateAccountExists(
        dto.customerAccountId,
        adminId,
      );

      if (!accountValidation.found) {
        throw new BadRequestException(
          `Account with ID "${dto.customerAccountId}" not found. Please select a valid customer, bank, or currency account.`,
        );
      }

      const [currency, customer] = await Promise.all([
        manager.findOneBy(AddCurrencyEntity, { id: dto.fromCurrencyId }),
        manager.findOneBy(CustomerAccountEntity, { id: dto.customerAccountId }),
      ]);

      if (!currency)
        throw new NotFoundException('From Currency Account not found');
      if (!customer) throw new NotFoundException('Customer Account not found');

      const expectedPkr = Number(dto.amountCurrency) * Number(dto.rate);

      if (Number(dto.amountPkr) !== expectedPkr) {
        throw new BadRequestException(
          'PKR amount mismatch with conversion rate',
        );
      }

      const entry = manager.create(SellingEntryEntity, {
        date: dto.date,
        sNo: dto.sNo,
        avgRate: dto.avgRate,
        manualRef: dto.manualRef,
        amountCurrency: dto.amountCurrency,
        rate: dto.rate,
        amountPkr: dto.amountPkr,
        margin: dto.margin,
        pl: dto.pl,
        description: dto.description,
        fromCurrency: currency,
        customerAccount: customer,
        adminId,
      });

      const relation = await manager.findOneBy(CurrencyRelationEntity, {
        userId,
        adminId,
        currencyId: currency.id,
      });

      await manager.update(
        CurrencyRelationEntity,
        { id: relation.id },
        {
          balance: Number(relation.balance) - Number(dto.amountCurrency),
          balancePkr:
            Number(relation.balancePkr) -
            Number(dto.avgRate) * Number(dto.amountCurrency),
        },
      );

      // 6️⃣ Save entry
      await manager.save(SellingEntryEntity, entry);

      await this.updateCurrencyStock(manager, adminId, currency.id);

      const redis = this.redisService.getClient();

      await redis.del(`dailyBooksReport:${adminId}:${dto.date}`);

      // Update account balance for the customer/bank/currency account
      if (accountValidation.type) {
        await this.updateAccountBalance(
          dto.customerAccountId,
          adminId,
          accountValidation.type,
        );
      }

      return entry;
    });
  }
}
