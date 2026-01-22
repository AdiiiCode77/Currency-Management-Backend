import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import { IsAdminGuard } from '../../../shared/guards/isAdmin.guard';
import { DashboardStatsService } from '../application/dashboard-stats.service';
import {
  DashboardStatsResponseDto,
  CardStatsDto,
  DashboardGraphsDto,
} from '../domain/dto/dashboard-stats.dto';

@ApiTags('Dashboard Stats')
@Controller('api/v1/dashboard/stats')
export class DashboardStatsController {
  constructor(private readonly dashboardStatsService: DashboardStatsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Get Complete Dashboard Statistics',
    description: 'Returns both card statistics and graph data for the dashboard. Includes revenue, profit, transactions, and various charts for visualization.',
  })
  @ApiOkResponse({
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardStatsResponseDto,
  })
  async getDashboardStats(@Req() req: Request): Promise<DashboardStatsResponseDto> {
    return this.dashboardStatsService.getDashboardStats(req.adminId);
  }

  @Get('cards')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Get Dashboard Card Statistics',
    description: 'Returns key metrics for dashboard cards including revenue, profit, transactions, customers, and balances.',
  })
  @ApiOkResponse({
    description: 'Card statistics retrieved successfully',
    type: CardStatsDto,
  })
  async getCardStats(@Req() req: Request): Promise<CardStatsDto> {
    return this.dashboardStatsService.getCardStats(req.adminId);
  }

  @Get('graphs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Get Dashboard Graph Data',
    description: 'Returns data for all dashboard charts including daily sales, currency distribution, top customers, monthly revenue, transaction types, and profit trends.',
  })
  @ApiOkResponse({
    description: 'Graph data retrieved successfully',
    type: DashboardGraphsDto,
  })
  async getGraphsData(@Req() req: Request): Promise<DashboardGraphsDto> {
    return this.dashboardStatsService.getGraphsData(req.adminId);
  }
}
