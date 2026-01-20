import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JournalService } from '../application/jounal.service';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';

@ApiTags('Journal Entries - Get')
@Controller('api/v1/journal')
export class JournalGetController {
  constructor(private readonly journalService: JournalService) {}

  // ------------------ JOURNAL ENTRIES ------------------
  @Get('all')
  @ApiOperation({ summary: 'Get all Journal Entries by Admin' })
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  async getAllJournalEntries(@Req() req: Request) {
    return await this.journalService.getAllJournalEntries(req.adminId);
  }

  // ------------------ BANK PAYMENT ------------------
  @Get('bank-payment/all')
  @ApiOperation({ summary: 'Get all Bank Payment Entries by Admin' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAllBankPaymentEntries(@Req() req: Request) {
    return await this.journalService.getAllBankPaymentEntries(req.adminId);
  }

  // ------------------ BANK RECEIVER ------------------
  @Get('bank-receiver/all')
  @ApiOperation({ summary: 'Get all Bank Receiver Entries by Admin' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAllBankReceiverEntries(@Req() req: Request) {
    return await this.journalService.getAllBankReceiverEntries(req.adminId);
  }

  // ------------------ CASH PAYMENT ------------------
  @Get('cash-payment/all')
  @ApiOperation({ summary: 'Get all Cash Payment Entries by Admin' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAllCashPaymentEntries(@Req() req: Request) {
    return await this.journalService.getAllCashPaymentEntries(req.adminId);
  }

  // ------------------ CASH RECEIVED ------------------
  @Get('cash-received/all')
  @ApiOperation({ summary: 'Get all Cash Received Entries by Admin' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAllCashReceivedEntries(@Req() req: Request) {
    return await this.journalService.getAllCashReceivedEntries(req.adminId);
  }

  //-------------------Common -------------------

@Get('accounts/list/ForEntry')
@ApiOperation({ summary: 'Get list of available Cr and Dr accounts for Journal Entries' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, IsAdminGuard)
async getAvailableAccounts(@Req() req: Request) {
  return await this.journalService.getAvailableAccounts(req.adminId);
}

}
