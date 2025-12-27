//constroller for report module
import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ReportService } from '../application/report.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
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

}