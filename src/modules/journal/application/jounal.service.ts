import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JournalEntryEntity } from '../domain/entity/journal-entry.entity';
import { CustomerAccountEntity } from '../../account/domain/entity/customer-account.entity';
import { CreateJournalEntryDto } from '../domain/dto/create-journal-entry.dto';
import { BankPaymentEntryEntity } from '../domain/entity/bank-payment-entry.entity';
import { CreateBankPaymentEntryDto } from '../domain/dto/create-bank-payment-entry.dto';
import { BankReceiverEntryEntity } from '../domain/entity/bank-receiver-entry.entity';
import { CreateBankReceiverEntryDto } from '../domain/dto/reate-bank-receiver-entry.dto';
import { CashPaymentEntryEntity } from '../domain/entity/cash-payment-entry.entity';
import { CreateCashPaymentEntryDto } from '../domain/dto/create-cash-payment-entry.dto';
import { CashReceivedEntryEntity } from '../domain/entity/cash-received-entry.entity';
import { CreateCashReceivedEntryDto } from '../domain/dto/create-cash-received-entry.dto';
import { BankAccountEntity } from '../../account/domain/entity/bank-account.entity';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(JournalEntryEntity)
    private readonly journalRepo: Repository<JournalEntryEntity>,

    @InjectRepository(CustomerAccountEntity)
    private readonly accountsRepo: Repository<CustomerAccountEntity>,

    @InjectRepository(BankPaymentEntryEntity)
    private readonly bankPaymentRepo: Repository<BankPaymentEntryEntity>,

    @InjectRepository(BankAccountEntity)
    private readonly bankAccount: Repository<BankAccountEntity>,

    @InjectRepository(BankReceiverEntryEntity)
    private readonly bankReceiverRepo: Repository<BankReceiverEntryEntity>,

    @InjectRepository(CashPaymentEntryEntity)
    private readonly cashPaymentRepo: Repository<CashPaymentEntryEntity>,

    @InjectRepository(CashReceivedEntryEntity)
    private readonly cashReceivedRepo: Repository<CashReceivedEntryEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async createJournalEntry(dto: CreateJournalEntryDto, adminId: string) {
    const crAccount = await this.accountsRepo.findOne({
      where: { id: dto.crAccountId },
    });
    const drAccount = await this.accountsRepo.findOne({
      where: { id: dto.drAccountId },
    });

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
      relations: ['crAccount', 'drAccount'],
    });
  }

  async createBankPaymentEntry(
    dto: CreateBankPaymentEntryDto,
    adminId: string,
  ) {
    const crAccount = await this.bankAccount.findOne({
      where: { id: dto.crAccountId },
    });
    const drAccount = await this.accountsRepo.findOne({
      where: { id: dto.drAccountId },
    });

    if (!drAccount || !crAccount) {
      throw new Error('Invalid account selected for credit or debit.');
    }

    const bankEntry = this.bankPaymentRepo.create({
      date: dto.date,
      crAccount,
      drAccount,
      amount: dto.amount,
      description: dto.description,
      chqNo: dto.chqNo,
      adminId,
    });

    return await this.bankPaymentRepo.save(bankEntry);
  }

  async getAllBankPaymentEntries(adminId: string) {
    return await this.bankPaymentRepo.find({
      where: { adminId },
      order: { date: 'DESC' },
      relations: ['crAccount', 'drAccount'],
    });
  }

  async createBankReceiverEntry(
    dto: CreateBankReceiverEntryDto,
    adminId: string,
  ) {
    const crAccount = await this.accountsRepo.findOne({
      where: { id: dto.crAccountId },
    });
    const drAccount = await this.bankAccount.findOne({
      where: { id: dto.drAccountId },
    });

    if (!crAccount || !drAccount) {
      throw new Error('Invalid account selected for credit or debit.');
    }

    const entry = this.bankReceiverRepo.create({
      date: dto.date,
      crAccount,
      drAccount,
      amount: dto.amount,
      branchCode: dto.branchCode,
      adminId,
    });

    return await this.bankReceiverRepo.save(entry);
  }

  async getAllBankReceiverEntries(adminId: string) {
    return await this.bankReceiverRepo.find({
      where: { adminId },
      order: { date: 'DESC' },
    });
  }

  async createCashPaymentEntry(
    dto: CreateCashPaymentEntryDto,
    adminId: string,
  ) {
    const drAccount = await this.accountsRepo.findOne({
      where: { id: dto.drAccountId },
    });

    if (!drAccount) {
      throw new Error('Invalid account selected for credit or debit.');
    }

    const entry = this.cashPaymentRepo.create({
      date: dto.date,
      crAccount: dto.crAccount,
      drAccount,
      amount: dto.amount,
      description: dto.description,
      adminId,
    });

    return await this.cashPaymentRepo.save(entry);
  }

  async getAllCashPaymentEntries(adminId: string) {
    return await this.cashPaymentRepo.find({
      where: { adminId },
      order: { date: 'DESC' },
    });
  }

  async createCashReceivedEntry(
    dto: CreateCashReceivedEntryDto,
    adminId: string,
  ) {
    const crAccount = await this.accountsRepo.findOne({
      where: { id: dto.crAccountId },
    });

    if (!crAccount) {
      throw new Error('Invalid account selected for credit or debit.');
    }

    const entry = this.cashReceivedRepo.create({
      date: dto.date,
      crAccount,
      drAccount: dto.drAccount,
      amount: dto.amount,
      description: dto.description,
      adminId,
    });

    return await this.cashReceivedRepo.save(entry);
  }

  async getAllCashReceivedEntries(adminId: string) {
    return await this.cashReceivedRepo.find({
      where: { adminId },
      order: { date: 'DESC' },
    });
  }

  async createMultipleJournalEntries(
    dtos: CreateJournalEntryDto[],
    adminId: string,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const entriesToSave: JournalEntryEntity[] = [];

      for (const dto of dtos) {
        const [crAccount, drAccount] = await Promise.all([
          manager.findOne(CustomerAccountEntity, {
            where: { id: dto.crAccountId },
          }),
          manager.findOne(CustomerAccountEntity, {
            where: { id: dto.drAccountId },
          }),
        ]);

        if (!crAccount || !drAccount) {
          throw new Error(
            `Invalid account selected for entry with description "${dto.description}"`,
          );
        }

        const entry = manager.create(JournalEntryEntity, {
          date: dto.date,
          paymentType: dto.paymentType,
          crAccount,
          drAccount,
          amount: dto.amount,
          description: dto.description,
          chqNo: dto.chqNo,
          adminId,
        });

        entriesToSave.push(entry);
      }

      // Insert all journal entries in one go
      return await manager.save(JournalEntryEntity, entriesToSave);
    });
  }

  async getAvailableAccounts(adminId: string) {
    const accounts = await this.accountsRepo.find({
      where: { adminId },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });

    return {
      crAccounts: accounts,
      drAccounts: accounts,
    };
  }
}
