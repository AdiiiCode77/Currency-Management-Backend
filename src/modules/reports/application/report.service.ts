// All Reports Service With Redis and High Scalabilty and Perfomace
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerCurrencyEntryEntity } from 'src/modules/currency/domain/entities/currency-entry.entity';
import { PurchaseEntryEntity } from 'src/modules/sale-purchase/domain/entity/purchase_entries.entity';
import { SellingEntryEntity } from 'src/modules/sale-purchase/domain/entity/selling_entries.entity';
import { RedisService } from 'src/shared/modules/redis/redis.service';
import { Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(SellingEntryEntity)
    private readonly sellingEntryRepository: Repository<SellingEntryEntity>,

    @InjectRepository(PurchaseEntryEntity)
    private readonly purchaseEntryRepository: Repository<PurchaseEntryEntity>,

    @InjectRepository(CustomerCurrencyEntryEntity)
    private readonly currencyEntryRepository: Repository<CustomerCurrencyEntryEntity>,

    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  async dailyBooksReport(adminId: string, date: string): Promise<any> {
    const cacheKey = `dailyBooksReport:${adminId}`;
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
}
