import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JournalService } from '../application/jounal.service';
import { CreateJournalEntryDto } from '../domain/dto/create-journal-entry.dto';
import { CreateBankPaymentEntryDto } from '../domain/dto/create-bank-payment-entry.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
import { CreateBankReceiverEntryDto } from '../domain/dto/reate-bank-receiver-entry.dto';
import { CreateCashPaymentEntryDto } from '../domain/dto/create-cash-payment-entry.dto';
import { CreateCashReceivedEntryDto } from '../domain/dto/create-cash-received-entry.dto';

@ApiTags('Journal Entries')
@Controller('api/v1/journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new Journal Entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async createJournalEntry(
    @Req() req: Request,
    @Body() dto: CreateJournalEntryDto,
  ) {
    return await this.journalService.createJournalEntry(dto, req.adminId);
  }

  @Post('bank-payment/create')
  @ApiOperation({ summary: 'Create a new Bank Payment Entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async createBankPaymentEntry(
    @Req() req: Request,
    @Body() dto: CreateBankPaymentEntryDto,
  ) {
    return await this.journalService.createBankPaymentEntry(dto, req.adminId);
  }

  @Post('bank-receiver/create')
  @ApiOperation({ summary: 'Create a new Bank Receiver Entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async createBankReceiverEntry(
    @Req() req: Request,
    @Body() dto: CreateBankReceiverEntryDto,
  ) {
    return await this.journalService.createBankReceiverEntry(dto, req.adminId);
  }

  @Post('cash-payment/create')
  @ApiOperation({ summary: 'Create a new Cash Payment Entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async createCashPaymentEntry(
    @Req() req: Request,
    @Body() dto: CreateCashPaymentEntryDto,
  ) {
    return await this.journalService.createCashPaymentEntry(dto, req.adminId);
  }

  @Post('cash-received/create')
  @ApiOperation({ summary: 'Create a new Cash Received Entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async createCashReceivedEntry(
    @Req() req: Request,
    @Body() dto: CreateCashReceivedEntryDto,
  ) {
    return await this.journalService.createCashReceivedEntry(dto, req.adminId);
  }

  @Post('create/multiple')
  @ApiOperation({ summary: 'Create multiple Journal Entries at once' })
  @ApiBearerAuth()
  @ApiBody({
    description: 'Array of Journal Entries to create',
    isArray: true,
    type: CreateJournalEntryDto,
    examples: {
      sample: {
        summary: 'Sample Journal Entry List',
        value: [
          {
            date: '2025-01-05',
            paymentType: 'Cust-to-Cust Online',
            crAccountId: 'f5180a17-2449-4c88-b86e-041ee160a9c8',
            drAccountId: '843ef714-3707-4906-b4ea-2eb1e4d2ba88',
            amount: 1500,
            description: 'Fuel expense',
            chqNo: '',
          },
          {
            date: '2025-01-05',
            paymentType: 'JV Payment',
            crAccountId: 'f5180a17-2449-4c88-b86e-041ee160a9c8',
            drAccountId: '843ef714-3707-4906-b4ea-2eb1e4d2ba88',
            amount: 9000,
            description: 'Supplier payment',
            chqNo: 'CHQ-5566',
          },
        ],
      },
    },
  })
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async createMultipleJournalEntries(
    @Req() req: Request,
    @Body() dtos: CreateJournalEntryDto[],
  ) {
    return await this.journalService.createMultipleJournalEntries(
      dtos,
      req.adminId,
    );
  }
}
