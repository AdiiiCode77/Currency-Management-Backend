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

@ApiTags('Update Accounts')
@ApiBearerAuth()
@Controller('api/v1/update-accounts')
@UseGuards(JwtAuthGuard, IsAdminGuard)
export class UpdateAccountsController {
  constructor(private readonly updateAccountsService: UpdateAccountsService) {}

  @Patch('customer/:id')
  @ApiOperation({ summary: 'Update existing Customer Account (partial)' })
  @ApiBody({ description: 'Partial Customer Account fields to update' })
  async updateCustomerAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateCustomerAccount(id, dto);
  }

  @Patch('bank/:id')
  @ApiOperation({ summary: 'Update existing Bank Account (partial)' })
  @ApiBody({ description: 'Partial Bank Account fields to update' })
  async updateBankAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateBankAccount(id, dto);
  }

  @Patch('general/:id')
  @ApiOperation({ summary: 'Update existing General Account (partial)' })
  @ApiBody({ description: 'Partial General Account fields to update' })
  async updateGeneralAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateGeneralAccount(id, dto);
  }

  @Patch('employee/:id')
  @ApiOperation({ summary: 'Update existing Employee Account (partial)' })
  @ApiBody({ description: 'Partial Employee Account fields to update' })
  async updateEmployeeAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateEmployeeAccount(id, dto);
  }

  @Patch('expense/:id')
  @ApiOperation({ summary: 'Update existing Expense Record (partial)' })
  @ApiBody({ description: 'Partial Expense fields to update' })
  async updateExpense(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateExpense(id, dto);
  }

  @Patch('chq-ref-bank/:id')
  @ApiOperation({ summary: 'Update existing Cheque Reference Bank (partial)' })
  @ApiBody({ description: 'Partial Cheque Reference Bank fields to update' })
  async updateChqRefBank(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateChqRefBank(id, dto);
  }

  @Patch('currency/:id')
  @ApiOperation({ summary: 'Update existing Currency (partial)' })
  @ApiBody({ description: 'Partial Currency fields to update' })
  async updateCurrency(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateCurrency(id, dto);
  }

  @Patch('currency-account/:id')
  @ApiOperation({ summary: 'Update existing Currency Account (partial)' })
  @ApiBody({ description: 'Partial Currency Account fields to update' })
  async updateCurrencyAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return await this.updateAccountsService.updateCurrencyAccount(id, dto);
  }
}
