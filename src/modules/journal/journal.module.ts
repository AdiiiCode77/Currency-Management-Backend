import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntryEntity } from './domain/entity/journal-entry.entity';
import { CustomerEntity } from '../users/domain/entities/customer.entity';
import { JournalService } from './application/jounal.service';
import { JournalController } from './interface/journal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntryEntity, CustomerEntity])],
  providers: [JournalService],
  controllers: [JournalController],
})
export class JournalModule {}
