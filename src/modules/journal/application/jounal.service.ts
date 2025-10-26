import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntryEntity } from '../domain/entity/journal-entry.entity';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
import { CreateJournalEntryDto } from '../domain/dto/create-journal-entry.dto';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(JournalEntryEntity)
    private readonly journalRepo: Repository<JournalEntryEntity>,
    @InjectRepository(CustomerAccountEntity)
    private readonly accountsRepo: Repository<CustomerAccountEntity>,
  ) {}

  async createJournalEntry(dto: CreateJournalEntryDto, adminId: string) {
    const crAccount = await this.accountsRepo.findOne({ where: { id: dto.crAccountId } });
    const drAccount = await this.accountsRepo.findOne({ where: { id: dto.drAccountId } });

    if (!crAccount || !drAccount) {
      throw new Error('Invalid account selected for credit or debit.');
    }

    const entry = this.journalRepo.create({
      date: dto.date,
      paymentType: dto.paymentType,
      crAccount,
      drAccount,
      amount: dto.amount,
      description: dto.description,
      chqNo: dto.chqNo,
      adminId,
    });

    return await this.journalRepo.save(entry);
  }

  async getAllJournalEntries(adminId: string) {
    return await this.journalRepo.find({
      where: { adminId },
      order: { date: 'DESC' },
    });
  }
}
