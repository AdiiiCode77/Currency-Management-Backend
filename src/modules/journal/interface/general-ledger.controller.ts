import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GeneralLedgerService } from '../application/general-ledger.service';
import { GetLedgerQueryDto, GetAccountBalanceDto } from '../domain/dto/get-ledger-query.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import { IsAdminGuard } from '../../../shared/guards/isAdmin.guard';

@ApiTags('General Ledger')
@ApiBearerAuth()
@Controller('general-ledger')
@UseGuards(JwtAuthGuard, IsAdminGuard)
export class GeneralLedgerController {
  constructor(private readonly generalLedgerService: GeneralLedgerService) {}

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get ledger entries for a specific account' })
  @ApiResponse({ status: 200, description: 'Returns ledger entries for the account' })
  async getAccountLedger(
    @Request() req,
    @Param('accountId') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const adminId = req.user.adminId;
    return await this.generalLedgerService.getAccountLedger(
      adminId,
      accountId,
      startDate,
      endDate,
    );
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions with optional filters' })
  @ApiResponse({ status: 200, description: 'Returns all transactions for the admin' })
  async getAllTransactions(
    @Request() req,
    @Query() query: GetLedgerQueryDto,
  ) {
    const adminId = req.user.adminId;

    if (query.accountId) {
      return await this.generalLedgerService.getAccountLedger(
        adminId,
        query.accountId,
        query.startDate,
        query.endDate,
      );
    }

    if (query.entryType) {
      return await this.generalLedgerService.getLedgerByEntryType(
        adminId,
        query.entryType,
        query.startDate,
        query.endDate,
      );
    }

    return await this.generalLedgerService.getAllTransactions(
      adminId,
      query.startDate,
      query.endDate,
    );
  }

  @Get('balance/:accountId')
  @ApiOperation({ summary: 'Calculate account balance from general ledger' })
  @ApiResponse({ status: 200, description: 'Returns account balance calculations' })
  async getAccountBalance(
    @Request() req,
    @Param('accountId') accountId: string,
    @Query('upToDate') upToDate?: string,
  ) {
    const adminId = req.user.adminId;
    return await this.generalLedgerService.calculateAccountBalance(
      adminId,
      accountId,
      upToDate,
    );
  }

  @Get('entry-type/:entryType')
  @ApiOperation({ summary: 'Get ledger entries by entry type' })
  @ApiResponse({ status: 200, description: 'Returns ledger entries filtered by type' })
  async getLedgerByEntryType(
    @Request() req,
    @Param('entryType') entryType: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const adminId = req.user.adminId;
    return await this.generalLedgerService.getLedgerByEntryType(
      adminId,
      entryType,
      startDate,
      endDate,
    );
  }
}
