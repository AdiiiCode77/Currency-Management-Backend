//constroller for report module
import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ReportService } from '../application/report.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiOkResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import { IsAdminGuard } from '../../../shared/guards/isAdmin.guard';
import { GetAccountLedgerDto } from '../domain/dto/account-ledger.dto';
import { start } from 'repl';
@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
    @Get('daily-books/:date')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiOperation({ summary: 'Get Daily Books Report' })
    async getDailyBooksReport(
      @Req() req: Request,
      @Param('date') date: string,
    ): Promise<any> {
      return this.reportService.dailyBooksReport(req.adminId, date);
    }

    @Get('currency-ledgers/:currency')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiQuery({ name: 'dateFrom', required: false , type: String })
    @ApiQuery({ name: 'dateTo', required: false , type: String })
    @ApiOperation({ summary: 'Get Currency Ledgers Report' })
    async getCurrencyLedgersReport(
      @Req() req: Request,
      @Param('currency') currency: string,
      @Query('dateFrom') dateFrom?: string,
      @Query('dateTo') dateTo?: string,
    ): Promise<any> {
      return this.reportService.ledgersCurrencyReport(
        req.adminId,
        currency,
        dateFrom,
        dateTo,
      );
    }

    @Get('currency-stocks')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiOperation({ summary: 'Get Currency Stocks for Admin' })
    @ApiOkResponse({
      description: 'Per-currency stock with totals',
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                code: { type: 'string' },
                amountPkr: { type: 'number', format: 'float' },
                amountCurrency: { type: 'number', format: 'float' },
                rate: { type: 'number', format: 'float' },
              },
            },
          },
          totals: {
            type: 'object',
            properties: {
              amountPkr: { type: 'number', format: 'float' },
              amountCurrency: { type: 'number', format: 'float' },
            },
          },
        },
      },
    })
    async getCurrencyStocks(@Req() req: Request): Promise<any> {
      return this.reportService.currencyStocks(req.adminId);
    }

    @Get('balance-sheet')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiQuery({ name: 'dateFrom', required: false, type: String })
    @ApiQuery({ name: 'dateTo', required: false, type: String })
    @ApiOperation({ summary: 'Get Comprehensive Balance Sheet for all Currencies, Customers, Banks and General Accounts' })
    @ApiOkResponse({
      description: 'Complete balance sheet with all accounts showing debits, credits, and balances',
      schema: {
        type: 'object',
        properties: {
          assets: {
            type: 'object',
            properties: {
              currencies: { type: 'array' },
              customers: { type: 'array' },
              banks: { type: 'array' },
              generalAccounts: { type: 'array' },
            },
          },
          liabilities: {
            type: 'object',
            properties: {
              currencies: { type: 'array' },
              customers: { type: 'array' },
              banks: { type: 'array' },
              generalAccounts: { type: 'array' },
            },
          },
          summary: {
            type: 'object',
            properties: {
              totalDebit: { type: 'number' },
              totalCredit: { type: 'number' },
              difference: { type: 'number' },
              isBalanced: { type: 'boolean' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    })
    async getBalanceSheet(
      @Req() req: Request,
      @Query('dateFrom') dateFrom?: string,
      @Query('dateTo') dateTo?: string,
    ): Promise<any> {
      const from = dateFrom ? new Date(dateFrom) : undefined;
      const to = dateTo ? new Date(dateTo) : undefined;
      return this.reportService.getBalanceSheet(req.adminId, from, to);
    }

    @Get('balance-sheet/detailed')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiQuery({ name: 'dateFrom', required: false, type: String })
    @ApiQuery({ name: 'dateTo', required: false, type: String })
    @ApiOperation({ summary: 'Get Detailed Balance Sheet with all Transaction Entries' })
    @ApiOkResponse({
      description: 'Detailed balance sheet with all transaction entries per account',
      schema: {
        type: 'object',
        properties: {
          accounts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                accountId: { type: 'string' },
                accountName: { type: 'string' },
                accountType: { type: 'string' },
                entries: { type: 'array' },
                totalDebit: { type: 'number' },
                totalCredit: { type: 'number' },
                closingBalance: { type: 'number' },
              },
            },
          },
          summary: {
            type: 'object',
            properties: {
              totalDebit: { type: 'number' },
              totalCredit: { type: 'number' },
              difference: { type: 'number' },
              isBalanced: { type: 'boolean' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    })
    async getDetailedBalanceSheet(
      @Req() req: Request,
      @Query('dateFrom') dateFrom?: string,
      @Query('dateTo') dateTo?: string,
    ): Promise<any> {
      const from = dateFrom ? new Date(dateFrom) : undefined;
      const to = dateTo ? new Date(dateTo) : undefined;
      return this.reportService.getDetailedBalanceSheet(req.adminId, from, to);
    }

    @Get('currency-income-statement')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiQuery({ name: 'dateFrom', required: false, type: String })
    @ApiQuery({ name: 'dateTo', required: false, type: String })
    @ApiOperation({ summary: 'Get Currency Income Statement with P&L Analysis' })
    @ApiOkResponse({
      description: 'Income statement showing revenue, cost, and profit/loss for each currency',
      schema: {
        type: 'object',
        properties: {
          currencies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                currencyId: { type: 'string' },
                currencyName: { type: 'string' },
                currencyCode: { type: 'string' },
                totalSalesCurrency: { type: 'number' },
                totalSalesPkr: { type: 'number' },
                averageSaleRate: { type: 'number' },
                totalPurchaseCurrency: { type: 'number' },
                totalPurchasePkr: { type: 'number' },
                averagePurchaseRate: { type: 'number' },
                currentStockCurrency: { type: 'number' },
                currentStockValuePkr: { type: 'number' },
                grossProfit: { type: 'number' },
                grossProfitMargin: { type: 'number' },
                netProfit: { type: 'number' },
                netProfitMargin: { type: 'number' },
                totalSalesTransactions: { type: 'number' },
                totalPurchaseTransactions: { type: 'number' },
              },
            },
          },
          summary: {
            type: 'object',
            properties: {
              totalRevenuePkr: { type: 'number' },
              totalCostPkr: { type: 'number' },
              totalGrossProfitPkr: { type: 'number' },
              totalNetProfitPkr: { type: 'number' },
              overallGrossMargin: { type: 'number' },
              overallNetMargin: { type: 'number' },
              totalCurrencies: { type: 'number' },
              totalSalesTransactions: { type: 'number' },
              totalPurchaseTransactions: { type: 'number' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    })
    async getCurrencyIncomeStatement(
      @Req() req: Request,
      @Query('dateFrom') dateFrom?: string,
      @Query('dateTo') dateTo?: string,
    ): Promise<any> {
      const from = dateFrom ? new Date(dateFrom) : undefined;
      const to = dateTo ? new Date(dateTo) : undefined;
      return this.reportService.getCurrencyIncomeStatement(req.adminId, from, to);
    }

    @Get('customer-currency-purchases')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiOperation({ summary: 'Get all purchase transactions for a specific customer and currency' })
    @ApiQuery({ name: 'customerId', required: true, type: String, description: 'Customer ID' })
    @ApiQuery({ name: 'currencyId', required: true, type: String, description: 'Currency ID' })
    @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
    @ApiOkResponse({
      description: 'Customer currency purchase report with all transactions',
      schema: {
        type: 'object',
        properties: {
          customer: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              contact: { type: 'string' },
              email: { type: 'string' },
            },
          },
          currency: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              code: { type: 'string' },
            },
          },
          purchases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                purchaseNumber: { type: 'number' },
                date: { type: 'string', format: 'date-time' },
                amountCurrency: { type: 'number' },
                amountPkr: { type: 'number' },
                rate: { type: 'number' },
              },
            },
          },
          summary: {
            type: 'object',
            properties: {
              totalTransactions: { type: 'number' },
              totalAmountCurrency: { type: 'number' },
              totalAmountPkr: { type: 'number' },
              averageRate: { type: 'number' },
            },
          },
        },
      },
    })
    async getCustomerCurrencyPurchaseReport(
      @Req() req: Request,
      @Query('customerId') customerId: string,
      @Query('currencyId') currencyId: string,
      @Query('dateFrom') dateFrom?: string,
      @Query('dateTo') dateTo?: string,
    ): Promise<any> {
      const from = dateFrom ? new Date(dateFrom) : undefined;
      const to = dateTo ? new Date(dateTo) : undefined;
      return this.reportService.getCustomerCurrencyPurchaseReport(
        req.adminId,
        customerId,
        currencyId,
        from,
        to,
      );
    }

    @Get('customer-currency-sales')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiOperation({ summary: 'Get all selling transactions for a specific customer and currency, plus account lists' })
    @ApiQuery({ name: 'customerId', required: true, type: String, description: 'Customer ID' })
    @ApiQuery({ name: 'currencyId', required: true, type: String, description: 'Currency ID' })
    @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
    @ApiOkResponse({
      description: 'Customer currency sale report with all transactions and account lists',
      schema: {
        type: 'object',
        properties: {
          customer: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              contact: { type: 'string' },
              email: { type: 'string' },
            },
          },
          currency: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              code: { type: 'string' },
            },
          },
          sales: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                sNo: { type: 'number' },
                date: { type: 'string', format: 'date-time' },
                amountCurrency: { type: 'number' },
                amountPkr: { type: 'number' },
                rate: { type: 'number' },
                pl: { type: 'number' },
              },
            },
          },
          summary: {
            type: 'object',
            properties: {
              totalTransactions: { type: 'number' },
              totalAmountCurrency: { type: 'number' },
              totalAmountPkr: { type: 'number' },
              averageRate: { type: 'number' },
              totalPl: { type: 'number' },
            },
          },
          accounts: {
            type: 'object',
            properties: {
              customers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    contact: { type: 'string' },
                    email: { type: 'string' },
                  },
                },
              },
              currencies: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    code: { type: 'string' },
                  },
                },
              },
              banks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    bankName: { type: 'string' },
                    accountNumber: { type: 'string' },
                    accountHolder: { type: 'string' },
                  },
                },
              },
              generals: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    accountType: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    })
    async getCustomerCurrencySaleReport(
      @Req() req: Request,
      @Query('customerId') customerId: string,
      @Query('currencyId') currencyId: string,
      @Query('dateFrom') dateFrom?: string,
      @Query('dateTo') dateTo?: string,
    ): Promise<any> {
      const from = dateFrom ? new Date(dateFrom) : undefined;
      const to = dateTo ? new Date(dateTo) : undefined;
      return this.reportService.getCustomerCurrencySaleReport(
        req.adminId,
        customerId,
        currencyId,
        from,
        to,
      );
    }

    @Get('account-ledger/:accountId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiOperation({ 
      summary: 'Get Account Ledger for any Account Type',
      description: 'Returns ledger entries for Customer, Bank, Currency, or General Account with running balance and totals'
    })
    @ApiParam({
      name: 'accountId',
      description: 'ID of the account (can be Customer, Bank, Currency, or General account)',
      type: String,
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
    @ApiQuery({ name: 'startDate', required: false, type: String, example: '2026-01-01' })
    @ApiQuery({ name: 'endDate', required: false, type: String, example: '2026-01-31' })
    @ApiOkResponse({
      description: 'Account ledger with all transactions and totals',
      schema: {
        type: 'object',
        properties: {
          accountId: { type: 'string' },
          accountName: { type: 'string' },
          accountType: { type: 'string', enum: ['CUSTOMER', 'BANK', 'CURRENCY', 'GENERAL'] },
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', example: '2026-01-15' },
                number: { type: 'string', example: 'INV-001' },
                paymentType: { type: 'string', example: 'Sale' },
                narration: { type: 'string', example: 'Sale to customer' },
                debit: { type: 'number', example: 1000 },
                credit: { type: 'number', example: 0 },
                balance: { type: 'number', example: 1000 },
              },
            },
          },
          totals: {
            type: 'object',
            properties: {
              totalCredit: { type: 'number' },
              totalDebit: { type: 'number' },
              totalChqInward: { type: 'number' },
              totalChqOutward: { type: 'number' },
              balance: { type: 'number' },
              total: { type: 'number' },
            },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
              totalRecords: { type: 'number' },
            },
          },
        },
      },
    })
    async getAccountLedger(
      @Req() req: Request,
      @Param('accountId') accountId: string,
      @Query('page') page?: number,
      @Query('limit') limit?: number,
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string,
    ): Promise<any> {
      return this.reportService.getAccountLedger(
        req.adminId,
        accountId,
        page || 1,
        limit || 50,
        startDate,
        endDate,
      );
    }

    @Post('clear-cache/:date')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiOperation({ summary: 'Clear Daily Books Report Cache for a specific date' })
    async clearDailyBooksCache(
      @Req() req: Request,
      @Param('date') date: string,
    ): Promise<any> {
      await this.reportService.clearDailyBooksCache(req.adminId, date);
      return { message: `Cache cleared for date ${date}` };
    }

}