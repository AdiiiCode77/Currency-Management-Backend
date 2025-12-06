import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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

@Injectable()
export class SalePurchaseService {
  constructor(
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
  ) {}

  async getCurrencyData(
    adminId: string,
    id: string,
    code: 'sale' | 'purchase',
  ) {
    const currency = await this.currencyRepo.findOne({ where: { id } });
    if (!currency) throw new BadRequestException('Currency Not Exists');

    const avgRateResult = await this.sellingRepo
      .createQueryBuilder('s')
      .select('AVG(s.rate)', 'avgRate')
      .where('s.adminId = :adminId', { adminId })
      .getRawOne();

    const AvgRate = parseFloat(avgRateResult?.avgRate) || 0;

    const balancesResult = await this.currency_relation
      .createQueryBuilder('cr')
      .select('SUM(cr.balance)', 'totalCurrency')
      .addSelect('SUM(cr.balancePkr)', 'totalPkr')
      .where('cr.currencyId = :currencyId', { currencyId: id })
      .andWhere('cr.adminId = :adminId', { adminId })
      .getRawOne();

    const totalCurrency = parseFloat(balancesResult?.totalCurrency) || 0;
    const totalPkr = parseFloat(balancesResult?.totalPkr) || 0;

    const prefix = code === 'sale' ? 'S' : 'P';
    let nextNumber = 1;

    if (code === 'sale') {
      const lastSale = await this.sellingRepo
        .createQueryBuilder('s')
        .select('s.saleNumber', 'saleNumber')
        .where('s.adminId = :adminId', { adminId })
        .orderBy('s.saleNumber', 'DESC')
        .limit(1)
        .getRawOne<{ saleNumber: number }>();

      nextNumber = lastSale ? lastSale.saleNumber + 1 : 1;
    } else {
      const lastPurchase = await this.purchaseRepo
        .createQueryBuilder('p')
        .select('p.purchaseNumber', 'purchaseNumber')
        .where('p.adminId = :adminId', { adminId })
        .orderBy('p.purchaseNumber', 'DESC')
        .limit(1)
        .getRawOne<{ purchaseNumber: number }>();

      nextNumber = lastPurchase ? lastPurchase.purchaseNumber + 1 : 1;
    }

    return {
      totalPkr,
      totalCurrency,
      AvgRate,
      S_NO: `${currency.code}-${prefix}-${nextNumber}`,
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
    const currency = await this.currencyRepo.findOne({
      where: { id: dto.fromCurrencyId },
    });
    if (!currency)
      throw new NotFoundException('From Currency Account not found');

    if (dto.amountPkr !== Number(dto.amountCurrency) * Number(dto.rate)) {
      throw new BadRequestException('PKR amount mismatch with conversion rate');
    }

    const customer = await this.customerRepo.findOne({
      where: { id: dto.customerAccountId },
    });

    if (!customer) throw new NotFoundException('Customer Account not found');

    const entry = this.sellingRepo.create({
      date: dto.date,
      sNo: dto.sNo,
      avgRate: dto.avgRate,
      manualRef: dto.manualRef,
      customerAccount: customer,
      amountCurrency: dto.amountCurrency,
      rate: dto.rate,
      amountPkr: dto.amountPkr,
      margin: dto.margin,
      pl: dto.pl,
      description: dto.description,
      fromCurrency: currency,
      adminId,
    });

    return this.sellingRepo.save(entry);
  }
}
