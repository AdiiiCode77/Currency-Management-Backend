import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import AccountService from '../application/account.service';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { PaginationDto } from 'src/shared/modules/dtos/pagination.dto';

@ApiTags('Accounts - Get')
@ApiBearerAuth()
@Controller('api/v1/accounts')
export class AccountGetController {
  constructor(private readonly accountService: AccountService) {}

  @Get('customer-accounts')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all Customer Accounts by Admin' })
  async getCustomerAccounts(@Req() req: Request, @Query() paginationDto: PaginationDto) {
    return await this.accountService.findAllUserAccount(req.adminId, paginationDto);
  }

  @Get('bank-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all Bank Accounts by Admin' })
  async getBankAccounts(@Req() req: Request, @Query() paginationDto: PaginationDto) {
    return await this.accountService.findAllBankAccount(req.adminId, paginationDto);
  }

  @Get('general-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all General Accounts by Admin' })
  async getGeneralAccounts(@Req() req: Request, @Query() paginationDto: PaginationDto) {
    return await this.accountService.getAllGeneralAccounts(req.adminId, paginationDto);
  }

  @Get('employee-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all Employee Accounts by Admin' })
  async getEmployeeAccounts(@Req() req: Request, @Query() paginationDto: PaginationDto) {
    return await this.accountService.getallEmplyeeAccount(req.adminId, paginationDto);
  }

  @Get('expense-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all Expense Accounts by Admin' })
  async getExpenses(@Req() req: Request, @Query() paginationDto: PaginationDto) {
    return await this.accountService.getAllExpenses(req.adminId, paginationDto);
  }

  @Get('list/chq-bank')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all Cheque Reference Banks by Admin' })
  async getChequeRefBanks(@Req() req: Request, @Query() paginationDto: PaginationDto) {
    return await this.accountService.getAllChqRefBank(req.adminId, paginationDto);
  }

  @Get('list/currency')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all Currencies by Admin' })
  async getCurrencies(@Req() req: Request, @Query() paginationDto: PaginationDto) {
    return await this.accountService.getAllCurrencies(req.adminId, paginationDto);
  }

  @Get('list/currencies')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all available currencies (without pagination)' })
  async getAllCurrenciesWithoutPagination(@Req() req: Request) {
    return await this.accountService.getAllCurrencieswithoutPagination(req.adminId);
  }

  @Get('list/currency-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all Currency Accounts by Admin' })
  async getCurrencyAccounts(@Req() req: Request, @Query() paginationDto: PaginationDto) {
    return await this.accountService.getAllCurrencyAccounts(req.adminId, paginationDto);
  }
}
