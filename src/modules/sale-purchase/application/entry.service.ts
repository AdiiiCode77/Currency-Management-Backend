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

    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,

    @InjectRepository(AdminEntity)
    private adminRepo: Repository<AdminEntity>,

    @InjectRepository(UserProfileEntity)
    private userProfileRepo: Repository<UserProfileEntity>,

    @InjectRepository(CurrencyRelationEntity)
    private readonly currency_relation: Repository<CurrencyRelationEntity>,

    private readonly dataSource: DataSource,

    private readonly redisService: RedisService,
  ) {}

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

      return entry;
    });
  }
}
