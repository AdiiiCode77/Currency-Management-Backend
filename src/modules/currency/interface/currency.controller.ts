import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CurrencyAccountService } from '../application/currency.service';
import { CustomerCreateCurrencyAccountDto } from '../domain/dto/create-currency-account.dto';
import { PaginationDto } from 'src/shared/modules/dtos/pagination.dto';
import { UpdateCustomerCurrencyAccountDto } from '../domain/dto/update-currency-accounts.dto';
import { CreateCurrencyEntryDto } from '../domain/dto/create-currency-entry.dto';
import { CreateMultipleCurrencyEntryDto } from '../domain/dto/multiple-currency-entry.dto';
import { DailyBookDto } from '../domain/dto/daily-book.dto';
import { CreateJournalEntryDto } from 'src/modules/journal/domain/dto/create-journal-entry.dto';
import { CreateCurrencyJournalEntryDto } from '../domain/dto/create-currency-journal-entry.dto';

@ApiTags('Currency Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, IsAdminGuard)
@Controller('/api/v1/currency-account')
export class CurrencyAccountController {
  constructor(private readonly service: CurrencyAccountService) {}

  // Add new currency account
  @Post('add')
  @ApiOperation({ summary: 'Add new Currency Account' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBody({
    type: CustomerCreateCurrencyAccountDto,
    description:
      'Payload to create a new Currency Account. Fields: accountType, name, accountInfo. adminId will be taken from logged-in user.',
  })
  create(@Body() dto: CustomerCreateCurrencyAccountDto, @Req() req: Request) {
    return this.service.createCurrencyAccount(dto, req.adminId);
  }

  @Post('singleEntry/add')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Add a single currency entry (JAMAM/BANAM)' })
  @ApiBody({ type: CreateCurrencyEntryDto })
  createEntry(@Body() dto: CreateCurrencyEntryDto, @Req() req: Request) {
    return this.service.createCurrencyEntry(dto, req.adminId);
  }

  @Post('journal/entries')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Add currency journal entries (Dr/Cr)' })
  @ApiBody({ type: CreateCurrencyJournalEntryDto })
  createJournalEntries(@Body() dto: CreateCurrencyJournalEntryDto, @Req() req: Request) {
    return this.service.createCurrencyJournalEntries(dto, req.adminId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Customer Currency Account by ID' })
  getCustomer(@Param('id') id: string) {
    return this.service.getCustomerById(id);
  }

  @Get('dropdown/:currencyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Get All Currency Accounts for Dropdown with Redis Caching',
  })
  async getCurrencyAccountsDropdown(
    @Param('currencyId') currencyId: string,
    @Req() req: Request,
  ) {
    return await this.service.getCurrencyAccountsDropdown(currencyId, req.adminId);
  }

  @Get('all-customer/:currencyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Get Customer Currency Accounts for Admin (Paginated)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default 10)',
  })
  getByAdmin(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
    @Param('currencyId') currency: string,
  ) {
    return this.service.getCustomersByAdmin(
      req.adminId,
      currency,
      paginationDto,
    );
  }

  @Get('daily-book/currency')
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'currencyId',
    required: true,
    type: String,
    description: 'Currency ID to filter daily book entries',
  })
  async getDailyBook(@Query() dto: DailyBookDto, @Query('currencyId') currencyId: string, @Req() req: Request) {
    return await this.service.getDailyBook(dto, req.adminId, currencyId);
  }
  // Update currency account (partial or full)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update Customer Currency Account (Partial or Full)',
  })
  @ApiBody({
    type: UpdateCustomerCurrencyAccountDto,
    description:
      'Payload to update a Currency Account. You can send only the fields you want to update.',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerCurrencyAccountDto,
  ) {
    return this.service.updateCustomer(id, dto);
  }

  @Get('ledgers-details/:cid/:currencyId')
  @ApiOperation({
    summary:
      'Get All Ledgers Based on Currency Accounts with optional date range filtering',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Start date in YYYY-MM-DD format (defaults to beginning of time)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'End date in YYYY-MM-DD format (defaults to today)',
  })
  async getLedgers(
    @Req() req: Request,
    @Param('cid') cid: string,
    @Param('currencyId') currencyId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.service.getLedgers(req.adminId, cid, currencyId, fromDate, toDate);
  }

  @Get('trial-balance/:currencyId')
  @ApiOperation({
    summary:
      'Get Currency Trial Balance for a specific currency',
  })
  async getCurrencyTrialBalance(@Req() req: Request, @Param('currencyId') currencyId: string) {
    return await this.service.currencyTrailBalance(req.adminId, currencyId);
  }
}
