import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { ChqInwardEntryEntity } from '../domain/entity/chq-inward-entry.entity';
import { CreateChqInwardEntryDto } from '../domain/dto/create-chq-inward-entry.dto';
import { CustomerAccountEntity } from '../../account/domain/entity/customer-account.entity';
import { AddChqRefBankEntity } from '../../account/domain/entity/add-chq-ref-bank.entity';
import { CreateChqOutwardEntryDto } from '../domain/dto/create-chq-outward-entry.dto';
import { ChqOutwardEntryEntity } from '../domain/entity/chq-outward-entry.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ChqInwardEntryEntity)
    private repo: Repository<ChqInwardEntryEntity>,

    @InjectRepository(ChqOutwardEntryEntity)
    private outwardRepo: Repository<ChqOutwardEntryEntity>,

    @InjectRepository(CustomerAccountEntity)
    private accountRepo: Repository<CustomerAccountEntity>,

    @InjectRepository(AddChqRefBankEntity)
    private bankRefRepo: Repository<AddChqRefBankEntity>,

    private dataSource: DataSource,
  ) {}

  async createChqInwardEntry(dto: CreateChqInwardEntryDto, adminId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromAcc = await this.accountRepo.findOne({
        where: { id: dto.fromAccountId },
      });
      const toAcc = await this.accountRepo.findOne({
        where: { id: dto.toAccountId },
      });
      const bankRef = await this.bankRefRepo.findOne({
        where: { id: dto.chqBankRefId },
      });

      if (!fromAcc)
        throw new BadRequestException('Invalid From Account selected.');
      if (!toAcc) throw new BadRequestException('Invalid To Account selected.');
      if (!bankRef)
        throw new BadRequestException(
          'Invalid Cheque Bank Reference selected.',
        );

      const entry = this.repo.create({
        entryDate: dto.entryDate,
        chqDate: dto.chqDate,
        postingDate: dto.postingDate,
        fromAccount: fromAcc,
        toAccount: toAcc,
        amount: dto.amount,
        chqBankRef: bankRef,
        chqNumber: dto.chqNumber,
        adminId,
      });

      const saved = await queryRunner.manager.save(entry);
      await queryRunner.commitTransaction();

      return {
        message: 'Cheque Inward Entry created successfully!',
        data: saved,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Unable to create cheque inward entry. Please try again later.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createMultipleChqInwardEntries(
    dtoArray: CreateChqInwardEntryDto[],
    adminId: string,
  ) {
    if (!dtoArray?.length) {
      throw new BadRequestException('Empty payload. No entries to process.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromAccIds = [...new Set(dtoArray.map((d) => d.fromAccountId))];
      const toAccIds = [...new Set(dtoArray.map((d) => d.toAccountId))];
      const bankRefIds = [...new Set(dtoArray.map((d) => d.chqBankRefId))];

      const [fromAccounts, toAccounts, bankRefs] = await Promise.all([
        this.accountRepo.findBy({ id: In(fromAccIds) }),
        this.accountRepo.findBy({ id: In(toAccIds) }),
        this.bankRefRepo.findBy({ id: In(bankRefIds) }),
      ]);

      const fromAccMap = new Map(fromAccounts.map((acc) => [acc.id, acc]));
      const toAccMap = new Map(toAccounts.map((acc) => [acc.id, acc]));
      const bankRefMap = new Map(bankRefs.map((b) => [b.id, b]));

      const errors = [];
      const validEntries = [];

      dtoArray.forEach((dto, index) => {
        const fromAcc = fromAccMap.get(dto.fromAccountId);
        const toAcc = toAccMap.get(dto.toAccountId);
        const bankRef = bankRefMap.get(dto.chqBankRefId);

        if (!fromAcc || !toAcc || !bankRef) {
          errors.push({
            index: index + 1,
            error: !fromAcc
              ? 'Invalid From Account'
              : !toAcc
                ? 'Invalid To Account'
                : 'Invalid Bank Reference',
          });
          return;
        }

        validEntries.push({
          entryDate: dto.entryDate,
          chqDate: dto.chqDate,
          postingDate: dto.postingDate,
          amount: dto.amount,
          chqNumber: dto.chqNumber,
          adminId,
          fromAccount: fromAcc,
          toAccount: toAcc,
          chqBankRef: bankRef,
        });
      });

      let saved = [];
      if (validEntries.length > 0) {
        saved = await queryRunner.manager.save(this.repo.create(validEntries));
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Batch processing completed.',
        total: dtoArray.length,
        successCount: saved.length,
        failedCount: errors.length,
        success: saved,
        failed: errors,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Unable to process cheque inward batch. Please try again later.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createChqOutwardEntry(dto: CreateChqOutwardEntryDto, adminId: string) {
    try {
      const fromAcc = await this.accountRepo.findOne({
        where: { id: dto.fromAccountId },
      });
      const toAcc = await this.accountRepo.findOne({
        where: { id: dto.toAccountId },
      });
      const bankRef = await this.bankRefRepo.findOne({
        where: { id: dto.chqBankRefId },
      });

      if (!fromAcc)
        throw new BadRequestException('Invalid From Account selected.');
      if (!toAcc) throw new BadRequestException('Invalid To Account selected.');
      if (!bankRef)
        throw new BadRequestException(
          'Invalid Cheque Bank Reference selected.',
        );

      const entry = this.outwardRepo.create({
        entryDate: dto.entryDate,
        chqDate: dto.chqDate,
        amount: dto.amount,
        chqNumber: dto.chqNumber,
        fromAccount: fromAcc,
        toAccount: toAcc,
        chqBankRef: bankRef,
        adminId,
      });

      const saved = await this.outwardRepo.save(entry);

      return {
        message: 'Cheque Outward Entry created successfully',
        data: saved,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to create cheque outward entry. Please try again later.',
      );
    }
  }

  async createMultipleChqOutwardEntries(
    dtoArray: CreateChqOutwardEntryDto[],
    adminId: string,
  ) {
    if (!dtoArray?.length) {
      throw new BadRequestException('No entries provided. Please provide at least one entry to process.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromAccIds = [...new Set(dtoArray.map((d) => d.fromAccountId))];
      const toAccIds = [...new Set(dtoArray.map((d) => d.toAccountId))];
      const bankRefIds = [...new Set(dtoArray.map((d) => d.chqBankRefId))];

      const [fromAccounts, toAccounts, bankRefs] = await Promise.all([
        this.accountRepo.findBy({ id: In(fromAccIds) }),
        this.accountRepo.findBy({ id: In(toAccIds) }),
        this.bankRefRepo.findBy({ id: In(bankRefIds) }),
      ]);

      const fromAccMap = new Map(fromAccounts.map((x) => [x.id, x]));
      const toAccMap = new Map(toAccounts.map((x) => [x.id, x]));
      const bankRefMap = new Map(bankRefs.map((x) => [x.id, x]));

      const errors = [];
      const validEntries = [];

      dtoArray.forEach((dto, index) => {
        const fromAcc = fromAccMap.get(dto.fromAccountId);
        const toAcc = toAccMap.get(dto.toAccountId);
        const bankRef = bankRefMap.get(dto.chqBankRefId);

        if (!fromAcc || !toAcc || !bankRef) {
          errors.push({
            index: index + 1,
            error: !fromAcc
              ? 'Invalid From Account'
              : !toAcc
                ? 'Invalid To Account'
                : 'Invalid Bank Reference',
          });
          return;
        }

        validEntries.push({
          entryDate: dto.entryDate,
          chqDate: dto.chqDate,
          amount: dto.amount,
          chqNumber: dto.chqNumber,
          adminId,
          fromAccount: fromAcc,
          toAccount: toAcc,
          chqBankRef: bankRef,
        });
      });

      let saved = [];
      if (validEntries.length > 0) {
        saved = await queryRunner.manager.save(
          this.outwardRepo.create(validEntries),
        );
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Batch processing completed.',
        total: dtoArray.length,
        successCount: saved.length,
        failedCount: errors.length,
        success: saved,
        failed: errors,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Unable to process cheque outward batch. Please try again later.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAllChqOutwardEntries(adminId: string) {
    try {
      const data = await this.outwardRepo.find({
        where: { adminId },
        relations: ['fromAccount', 'toAccount', 'chqBankRef'],
        order: { entryDate: 'DESC' },
      });

      return {
        message: 'All cheque outward entries fetched successfully.',
        count: data.length,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to fetch cheque outward entries. Please try again later.',
      );
    }
  }

  async getAllChqInwardEntries(adminId: string) {
    try {
      const data = await this.repo.find({
        where: { adminId },
        relations: ['fromAccount', 'toAccount', 'chqBankRef'],
        order: { entryDate: 'DESC' }, // latest first
      });

      return {
        message: 'All cheque inward entries fetched successfully.',
        count: data.length,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to fetch cheque inward entries. Please try again later.',
      );
    }
  }
}
