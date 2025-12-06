import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseEntryEntity } from '../domain/entity/purchase_entries.entity';
import { SellingEntryEntity } from '../domain/entity/selling_entries.entity';
import { CurrencyAccountEntity } from 'src/modules/account/domain/entity/currency-account.entity';
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
    private readonly currency_relation: Repository<CurrencyRelationEntity>
  ) {}

  async getCurrencyData(id: string) {
    const currency = await this.currencyRepo.findOne({
      where: { id },
      select: ["code"],
    });
  
    if (!currency) {
      throw new NotFoundException("Currency Account not found");
    }
  
    const { totalAmount, avgAmount, lastPurchaseCode } =
      await this.sellingRepo
        .createQueryBuilder("s")
        .select("SUM(s.amountCurrency)", "totalAmount")
        .addSelect("AVG(s.rate)", "avgAmount")
        .addSelect(
          `(SELECT s2.purchaseCode 
             FROM selling s2 
             WHERE s2.fromCurrencyId = :id 
             ORDER BY s2.createdAt DESC 
             LIMIT 1)`,
          "lastPurchaseCode"
        )
        .where("s.fromCurrencyId = :id", { id })
        .getRawOne();

    let nextNumber = 101;
  
    if (lastPurchaseCode) {
      const num = Number(lastPurchaseCode.split("-")[1]);
      if (!isNaN(num)) nextNumber = num + 1;
    }
  
    const P_No = `${currency.code}-${nextNumber}`;

    if (!totalAmount) {
      return {
        currency: 0,
        AvgRate: 0,
        Pkr: 0,
        P_No,
      };
    }
  
    const total = Number(totalAmount);
    const avg = Number(avgAmount);
    const Pkr = total * 67.8;
  
    return {
      currency: total,
      AvgRate: avg,
      Pkr,
      P_No,
    };
  }
  
  
  async getPkrAmount(AmountCurrenct: number, Rate: number){
    return {
      amountPkr: (AmountCurrenct * Rate)
    }
 }
  async createPurchase(dto: CreatePurchaseDto, adminId: string) {
    const admin = await this.adminRepo.findOne({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException("Admin not found");
  
    const userProfile = await this.userProfileRepo.findOne({
      where: { id: admin.user_profile_id },
      relations: ["user"],
    });
  
    if (!userProfile) throw new NotFoundException("User profile not found");
  
    const user = userProfile.user;
    if (!user) throw new NotFoundException("User not found");
  
    const [currency, customer] = await Promise.all([
      this.currencyRepo.findOne({ where: { id: dto.currencyDrId } }),
      this.customerRepo.findOne({ where: { id: dto.customerAccountId } }),
    ]);
  
    if (!currency) throw new NotFoundException("Currency DR Account not found");
    if (!customer) throw new NotFoundException("Customer Account not found");
  
    const entry = this.purchaseRepo.create({
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
  
    let relation = await this.currency_relation.findOne({
      where: {
        userId: user.id,
        adminId,
        currencyId: currency.id,
      },
    });
  
    if (!relation) {
      relation = this.currency_relation.create({
        userId: user.id,
        adminId,
        currencyId: currency.id,
        balance: dto.amountCurrency,
        balancePkr: dto.amountPkr,
      });
    } else {
      relation.balance += Number(dto.amountCurrency);
      relation.balancePkr+= Number(dto.amountPkr)
    }
  
    await Promise.all([
      this.currency_relation.save(relation),
      this.purchaseRepo.save(entry),
    ]);
  
    return entry;
  }
  
  

  async createSelling(dto: CreateSellingDto, adminId: string) {
    const currency = await this.currencyRepo.findOne({ where: { id: dto.fromCurrencyId } });
    if (!currency) throw new NotFoundException('From Currency Account not found');

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
