import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import AccountService from '../application/account.service';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
import { CreateCustomerAccountDto } from '../domain/dto/create-customer-account.dto';
import { Request } from 'express';
import { CreateBankAccountDto } from '../domain/dto/create-bank-account.dto';
import { CreateGeneralAccountDto } from '../domain/dto/create-general-account.dto';
import { CreateEmployeeAccountDto } from '../domain/dto/create-employee-account.dto';
import { PaginationDto } from 'src/shared/modules/dtos/pagination.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { CreateAddExpenseDto } from '../domain/dto/create-add-expense.dto';
import { CreateAddChqRefBankDto } from '../domain/dto/create-add-chq-ref-bank.dto';
import { CreateAddCurrencyDto } from '../domain/dto/create-add-currency.dto';
import { CreateCurrencyAccountDto } from '../domain/dto/create-currency-account.dto';
// adjust path as needed

@ApiTags('Customer Accounts')
@ApiBearerAuth()
@Controller('api/v1/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('customer-accounts')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Create a new customer account' })
  @ApiBody({ type: CreateCustomerAccountDto })
  async create(@Body() dto: CreateCustomerAccountDto, @Req() req: Request) {
    const adminId = req.adminId;
    console.log('Admin ID:', adminId);
    return await this.accountService.addUserAccount(dto, adminId);
  }

  @Get('customer-accounts')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all customer accounts for the admin' })
  async findAllUserAcc(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const adminId = req.adminId;
    return await this.accountService.findAllUserAccount(adminId, paginationDto);
  }

  @Post('bank-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBody({ type: CreateBankAccountDto })
  async createBankAcc(@Body() dto: CreateBankAccountDto, @Req() req: Request) {
    const adminId = req.adminId;
    return await this.accountService.addBankAccount(dto, adminId);
  }

  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Get('bank-account')
  async findAll(@Req() req: Request, @Query() paginationDto: PaginationDto) {
    const adminId = req.adminId;
    return await this.accountService.findAllBankAccount(adminId, paginationDto);
  }

  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Post('general-account')
  @ApiBody({ type: CreateGeneralAccountDto })
  async createGeneralAccount(
    @Body() dto: CreateGeneralAccountDto,
    @Req() req: Request,
  ) {
    const adminId = req.adminId;
    return await this.accountService.addGeneralAccount(dto, adminId);
  }

  @Get('general-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAllGeneralAccounts(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const adminId = req.adminId;
    return await this.accountService.getAllGeneralAccounts(
      adminId,
      paginationDto,
    );
  }

  @Post('employee-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBody({ type: CreateEmployeeAccountDto })
  async addEmplyeeAcc(
    @Body() dto: CreateEmployeeAccountDto,
    @Req() req: Request,
  ) {
    const adminId = req.adminId;
    return await this.accountService.addEmplyeeAccount(dto, adminId);
  }

  @Get('employee-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAllEmplyeeAccounts(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const adminId = req.adminId;
    return await this.accountService.getallEmplyeeAccount(
      adminId,
      paginationDto,
    );
  }

  @Post('expense-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Create new expense by Admin' })
  @ApiBearerAuth()
  async addExpense(@Req() req: Request, @Body() dto: CreateAddExpenseDto) {
    return await this.accountService.addExpense(dto, req.adminId);
  }

  @Get('expense-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all expenses by Admin with pagination' })
  async getAllExpenses(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.accountService.getAllExpenses(req.adminId, paginationDto);
  }

  @Post('create/chq-bank')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Create a new Cheque Reference Bank by Admin' })
  @ApiBearerAuth()
  async addChqRefBank(
    @Req() req: Request,
    @Body() dto: CreateAddChqRefBankDto,
  ) {
    return await this.accountService.addChqRefBank(dto, req.adminId);
  }

  @Get('list/chq-bank')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Get all Cheque Reference Banks by Admin with pagination',
  })
  async getAllChqRefBank(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.accountService.getAllChqRefBank(
      req.adminId,
      paginationDto,
    );
  }

  @Post('create/cuurency')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Create a new currency by Admin' })
  @ApiBearerAuth()
  async addCurrency(@Req() req: Request, @Body() dto: CreateAddCurrencyDto) {
    return await this.accountService.addCurrency(dto, req.adminId);
  }

  @Get('list/currency')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all currencies by Admin with pagination' })
  async getAllCurrencies(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.accountService.getAllCurrencies(
      req.adminId,
      paginationDto,
    );
  }

  @Post('create/currency-account')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Create a new Currency Account by Admin' })
  @ApiBearerAuth()
  async createCurrencyAccount(
    @Req() req: Request,
    @Body() dto: CreateCurrencyAccountDto,
  ) {
    return await this.accountService.createCurrencyAccount(dto, req.adminId);
  }

  @Get('list/currencies')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({ summary: 'Get all available currencies (name + id)' })
  async getAllCurrencieswithoutPagination(@Req() req: Request) {
    return await this.accountService.getAllCurrencieswithoutPagination(req.adminId);
  }
  @Get('list/currency-account')
  @ApiOperation({ summary: 'Get all Currency Accounts by Admin with pagination' })
  async getAllCurrencyAccounts(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.accountService.getAllCurrencyAccounts(req.adminId, paginationDto);
  }
}
