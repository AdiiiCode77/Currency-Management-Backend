//constroller for report module
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ReportService } from '../application/report.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
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
}