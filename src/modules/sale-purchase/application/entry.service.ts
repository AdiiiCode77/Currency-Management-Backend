import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseEntryEntity } from '../domain/entity/purchase_entries.entity';
import { SellingEntryEntity } from '../domain/entity/selling_entries.entity';
import { CurrencyAccountEntity } from 'src/modules/account/domain/entity/currency-account.entity';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
import { CreatePurchaseDto } from '../domain/dto/purchase-create.dto';
import { CreateSellingDto } from '../domain/dto/selling-create.dto';

@Injectable()
export class SalePurchaseService {
  constructor(
    @InjectRepository(PurchaseEntryEntity)
    private purchaseRepo: Repository<PurchaseEntryEntity>,

    @InjectRepository(SellingEntryEntity)
    private sellingRepo: Repository<SellingEntryEntity>,

    @InjectRepository(CurrencyAccountEntity)
    private currencyRepo: Repository<CurrencyAccountEntity>,

    @InjectRepository(CustomerAccountEntity)
    private customerRepo: Repository<CustomerAccountEntity>,

  ) {}

  async createPurchase(dto: CreatePurchaseDto, adminId: string) {
    const currency = await this.currencyRepo.findOne({ where: { id: dto.currencyDrId } });
    if (!currency) throw new NotFoundException('Currency DR Account not found');

    const customer = await this.customerRepo.findOne({ where: { id: dto.customerAccountId } });
    if (!customer) throw new NotFoundException('Customer Account not found');

    if (dto.amountPkr !== Number(dto.amountCurrency) * Number(dto.rate)) {
      throw new BadRequestException('Amount(PKR) mismatch with rate calculation');
    }

    const entry = this.purchaseRepo.create({
      date: dto.date,
      manualRef: dto.manualRef,
      amountCurrency: dto.amountCurrency,
      rate: dto.rate,
      amountPkr: dto.amountPkr,
      description: dto.description,
      currencyDr: currency,
      customerAccount: customer,
      adminId: adminId,
    });

    return this.purchaseRepo.save(entry);
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
