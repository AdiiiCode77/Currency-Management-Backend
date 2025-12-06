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
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
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

  @Post('multipleEntry/add')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Add multiple currency entries at once (JAMAM/BANAM)',
  })
  @ApiBody({ type: CreateMultipleCurrencyEntryDto })
  createMultipleEntries(
    @Body() dto: CreateMultipleCurrencyEntryDto,
    @Req() req: Request,
  ) {
    return this.service.createMultipleCurrencyEntries(dto, req.adminId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get Customer Currency Account by ID' })
  getCustomer(@Param('id') id: string) {
    return this.service.getCustomerById(id);
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
    @Param(':currencyId') cuurency: string,
  ) {
    return this.service.getCustomersByAdmin(
      req.adminId,
      cuurency,
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
  async getDailyBook(@Query() dto: DailyBookDto, @Req() req: Request) {
    return await this.service.getDailyBook(dto, req.adminId);
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

  @Get('ledgers-details/:cid')
  @ApiOperation({
    summary:
      'Get All Ledgers Based on Currency Accounts Give Currency Account Id in Param as cid',
  })
  async getLedgers(@Req() req: Request, @Param('cid') cid: string) {
    return await this.service.getLedgers(req.adminId, cid);
  }
}
