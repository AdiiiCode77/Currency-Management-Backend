import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GeneralLedgerEntity } from '../domain/entity/general-ledger.entity';

export interface CreateLedgerEntryDto {
  adminId: string;
  transactionDate: Date | string;
  accountId: string;
  accountName: string;
  accountType: 'CUSTOMER' | 'BANK' | 'CURRENCY' | 'GENERAL';
  entryType:
    | 'SALE'
    | 'PURCHASE'
    | 'JOURNAL'
    | 'BANK_PAYMENT'
    | 'BANK_RECEIPT'
    | 'CASH_PAYMENT'
    | 'CASH_RECEIPT'
    | 'CHQ_INWARD'
    | 'CHQ_OUTWARD'
    | 'CURRENCY_ENTRY'
    | 'CURRENCY_JOURNAL';
  sourceEntryId: string;
  referenceNumber?: string;
  debitAmount?: number;
  creditAmount?: number;
  currencyAmount?: number;
  currencyCode?: string;
  exchangeRate?: number;
  description?: string;
  paymentType?: string;
  contraAccountId?: string;
  contraAccountName?: string;
}

@Injectable()
export class GeneralLedgerService {
  constructor(
    @InjectRepository(GeneralLedgerEntity)
    private readonly generalLedgerRepository: Repository<GeneralLedgerEntity>,
  ) {}

  /**
   * Create a single ledger entry
   * Use this when you have a single transaction manager
   */
  async createLedgerEntry(
    dto: CreateLedgerEntryDto,
    manager?: EntityManager,
  ): Promise<GeneralLedgerEntity> {
    const repository = manager
      ? manager.getRepository(GeneralLedgerEntity)
      : this.generalLedgerRepository;

    const ledgerEntry = repository.create({
      adminId: dto.adminId,
      transactionDate: dto.transactionDate,
      accountId: dto.accountId,
      accountName: dto.accountName,
      accountType: dto.accountType,
      entryType: dto.entryType,
      sourceEntryId: dto.sourceEntryId,
      referenceNumber: dto.referenceNumber,
      debitAmount: dto.debitAmount || 0,
      creditAmount: dto.creditAmount || 0,
      currencyAmount: dto.currencyAmount,
      currencyCode: dto.currencyCode,
      exchangeRate: dto.exchangeRate,
      description: dto.description,
      paymentType: dto.paymentType,
      contraAccountId: dto.contraAccountId,
      contraAccountName: dto.contraAccountName,
    });

    return await repository.save(ledgerEntry);
  }

  /**
   * Create multiple ledger entries (for double-entry transactions)
   * Example: Sale transaction creates 2 entries (debit customer, credit currency)
   */
  async createLedgerEntries(
    dtos: CreateLedgerEntryDto[],
    manager?: EntityManager,
  ): Promise<GeneralLedgerEntity[]> {
    const repository = manager
      ? manager.getRepository(GeneralLedgerEntity)
      : this.generalLedgerRepository;

    const entries = dtos.map((dto) =>
      repository.create({
        adminId: dto.adminId,
        transactionDate: dto.transactionDate,
        accountId: dto.accountId,
        accountName: dto.accountName,
        accountType: dto.accountType,
        entryType: dto.entryType,
        sourceEntryId: dto.sourceEntryId,
        referenceNumber: dto.referenceNumber,
        debitAmount: dto.debitAmount || 0,
        creditAmount: dto.creditAmount || 0,
        currencyAmount: dto.currencyAmount,
        currencyCode: dto.currencyCode,
        exchangeRate: dto.exchangeRate,
        description: dto.description,
        paymentType: dto.paymentType,
        contraAccountId: dto.contraAccountId,
        contraAccountName: dto.contraAccountName,
      }),
    );

    return await repository.save(entries);
  }

  /**
   * Get ledger entries for a specific account
   */
  async getAccountLedger(
    adminId: string,
    accountId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<GeneralLedgerEntity[]> {
    const query = this.generalLedgerRepository
      .createQueryBuilder('gl')
      .where('gl.adminId = :adminId', { adminId })
      .andWhere('gl.accountId = :accountId', { accountId })
      .orderBy('gl.transactionDate', 'ASC')
      .addOrderBy('gl.createdAt', 'ASC');

    if (startDate) {
      query.andWhere('gl.transactionDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('gl.transactionDate <= :endDate', { endDate });
    }

    return await query.getMany();
  }

  /**
   * Get all ledger entries by entry type
   */
  async getLedgerByEntryType(
    adminId: string,
    entryType: string,
    startDate?: string,
    endDate?: string,
  ): Promise<GeneralLedgerEntity[]> {
    const query = this.generalLedgerRepository
      .createQueryBuilder('gl')
      .where('gl.adminId = :adminId', { adminId })
      .andWhere('gl.entryType = :entryType', { entryType })
      .orderBy('gl.transactionDate', 'ASC')
      .addOrderBy('gl.createdAt', 'ASC');

    if (startDate) {
      query.andWhere('gl.transactionDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('gl.transactionDate <= :endDate', { endDate });
    }

    return await query.getMany();
  }

  /**
   * Get all transactions for an admin within a date range
   */
  async getAllTransactions(
    adminId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<GeneralLedgerEntity[]> {
    const query = this.generalLedgerRepository
      .createQueryBuilder('gl')
      .where('gl.adminId = :adminId', { adminId })
      .orderBy('gl.transactionDate', 'DESC')
      .addOrderBy('gl.createdAt', 'DESC');

    if (startDate) {
      query.andWhere('gl.transactionDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('gl.transactionDate <= :endDate', { endDate });
    }

    return await query.getMany();
  }

  /**
   * Get ledger entries by source entry
   */
  async getLedgerBySourceEntry(
    sourceEntryId: string,
    entryType: string,
  ): Promise<GeneralLedgerEntity[]> {
    return await this.generalLedgerRepository.find({
      where: {
        sourceEntryId,
        entryType: entryType as any,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  /**
   * Delete ledger entries for a specific source entry (for reversal/deletion)
   */
  async deleteLedgerEntriesBySource(
    sourceEntryId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(GeneralLedgerEntity)
      : this.generalLedgerRepository;

    await repository.delete({ sourceEntryId });
  }

  /**
   * Calculate account balance from general ledger
   */
  async calculateAccountBalance(
    adminId: string,
    accountId: string,
    upToDate?: string,
  ): Promise<{ debit: number; credit: number; balance: number }> {
    const query = this.generalLedgerRepository
      .createQueryBuilder('gl')
      .where('gl.adminId = :adminId', { adminId })
      .andWhere('gl.accountId = :accountId', { accountId });

    if (upToDate) {
      query.andWhere('gl.transactionDate <= :upToDate', { upToDate });
    }

    const result = await query
      .select('SUM(gl.debitAmount)', 'totalDebit')
      .addSelect('SUM(gl.creditAmount)', 'totalCredit')
      .getRawOne();

    const totalDebit = Number(result?.totalDebit || 0);
    const totalCredit = Number(result?.totalCredit || 0);

    return {
      debit: totalDebit,
      credit: totalCredit,
      balance: totalDebit - totalCredit,
    };
  }
}
