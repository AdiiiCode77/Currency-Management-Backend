import {
  Body,
  Controller,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
import { UpdateAccountsService } from '../application/update-accounts.service';
import { CreateCustomerAccountDto } from '../domain/dto/create-customer-account.dto';
import { CreateBankAccountDto } from '../domain/dto/create-bank-account.dto';
import { CreateGeneralAccountDto } from '../domain/dto/create-general-account.dto';
import { CreateEmployeeAccountDto } from '../domain/dto/create-employee-account.dto';
import { CreateAddExpenseDto } from '../domain/dto/create-add-expense.dto';
import { CreateAddChqRefBankDto } from '../domain/dto/create-add-chq-ref-bank.dto';
import { CreateAddCurrencyDto } from '../domain/dto/create-add-currency.dto';
import { CreateCurrencyAccountDto } from '../domain/dto/create-currency-account.dto';
import { UUID } from 'crypto';

@ApiTags('Update Accounts')
@ApiBearerAuth()
@Controller('api/v1/update-accounts')
export class UpdateAccountsController {
  constructor(private readonly updateAccountsService: UpdateAccountsService) {}

  @Patch('customer/:id')
  @ApiOperation({ summary: 'Update existing Customer Account (partial)' })
  @ApiBody({
    type: CreateCustomerAccountDto,
    description: 'Provide only fields you want to update.',
  })
  async updateCustomerAccount(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateCustomerAccount(id, dto);
  }

  @Patch('bank/:id')
  @ApiOperation({ summary: 'Update existing Bank Account (partial)' })
  @ApiBody({
    type: CreateBankAccountDto,
    description: 'Provide only fields you want to update.',
  })
  async updateBankAccount(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateBankAccount(id, dto);
  }

  @Patch('general/:id')
  @ApiOperation({ summary: 'Update existing General Account (partial)' })
  @ApiBody({ description: 'Partial General Account fields to update' })
  @ApiBody({
    type: CreateGeneralAccountDto,
    description: 'Provide only fields you want to update.',
  })
  async updateGeneralAccount(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateGeneralAccount(id, dto);
  }

  @Patch('employee/:id')
  @ApiOperation({ summary: 'Update existing Employee Account (partial)' })
  @ApiBody({
    type: CreateEmployeeAccountDto,
    description: 'Provide only fields you want to update.',
  })  async updateEmployeeAccount(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateEmployeeAccount(id, dto);
  }

  @Patch('expense/:id')
  @ApiOperation({ summary: 'Update existing Expense Record (partial)' })
  @ApiBody({
    type: CreateAddExpenseDto,
    description: 'Provide only fields you want to update.',
  })  async updateExpense(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateExpense(id, dto);
  }

  @Patch('chq-ref-bank/:id')
  @ApiOperation({ summary: 'Update existing Cheque Reference Bank (partial)' })
  @ApiBody({
    type: CreateAddChqRefBankDto,
    description: 'Provide only fields you want to update.',
  })  async updateChqRefBank(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateChqRefBank(id, dto);
  }

  @Patch('currency/:id')
  @ApiOperation({ summary: 'Update existing Currency (partial)' })
  @ApiBody({
    type: CreateAddCurrencyDto,
    description: 'Provide only fields you want to update.',
  })
  async updateCurrency(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateCurrency(id, dto);
  }

  @Patch('currency-account/:id')
  @ApiOperation({ summary: 'Update existing Currency Account (partial)' })
  @ApiBody({
    type: CreateCurrencyAccountDto,
    description: 'Provide only fields you want to update.',
  })  async updateCurrencyAccount(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateCurrencyAccount(id, dto);
  }
}
