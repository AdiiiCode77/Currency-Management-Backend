import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SalePurchaseService } from '../application/entry.service';
import { CreatePurchaseDto } from '../domain/dto/purchase-create.dto';
import { CreateSellingDto } from '../domain/dto/selling-create.dto';
import { UpdatePurchaseDto } from '../domain/dto/purchase-update.dto';
import { UpdateSellingDto } from '../domain/dto/selling-update.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import { IsAdminGuard } from '../../../shared/guards/isAdmin.guard';
import { Request } from 'express';
import { CurrencyPnlPreviewDto } from '../domain/dto/CurrencyPnlPreview.dto';

@ApiTags('Sale & Purchase Entries')
@Controller('api/v1/sale-purchase')
export class SalePurchaseController {
  constructor(private readonly service: SalePurchaseService) {}

  // ✅ PURCHASE ENTRY
  @Post('purchase')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Create Purchase Entry',
    description:
      'Creates a purchase entry with currency DR, customer account, PKR calculation, and admin audit.',
  })
  @ApiBody({ type: CreatePurchaseDto })
  createPurchase(@Body() dto: CreatePurchaseDto, @Req() req: Request) {
    return this.service.createPurchase(dto, req.adminId);
  }

  @Post('selling')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Create Selling Entry',
    description:
      'Creates a selling entry with from-currency, conversion rate, margin, P/L, and admin tracking.',
  })
  @ApiBody({
    type: CreateSellingDto,
    description:
      'Payload required to create a Selling Entry. Validates conversion rates and relations.',
  })
  createSelling(@Body() dto: CreateSellingDto, @Req() req: Request) {
    return this.service.createSelling(dto, req.adminId);
  }

  @Get(':id/data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getCurrencyData(
    @Req() req: Request,
    @Param('id') currencyId: string,
    @Query('code') code: 'sale' | 'purchase',
  ) {
    return await this.service.getCurrencyData(req.adminId, currencyId, code);
  }

  @Post('pnl/preview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
    @ApiBody({
    type: CurrencyPnlPreviewDto,
    description:
      'Payload required to create a Selling Entry. Validates conversion rates and relations.',
  })
  async getCurrencyPnlPreview(
    @Body() dto: CurrencyPnlPreviewDto,
    @Req() req: Request,
  ) {
    return this.service.getCurrencyPnlPreview(req.adminId, dto);
  }

  // ✅ GET PURCHASE ENTRY BY ID
  @Get('purchase/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Get Purchase Entry by ID',
    description: 'Retrieves a specific purchase entry with all related data.',
  })
  async getPurchaseById(@Param('id') entryId: string, @Req() req: Request) {
    return this.service.getPurchaseById(entryId, req.adminId);
  }

  // ✅ GET SELLING ENTRY BY ID
  @Get('selling/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Get Selling Entry by ID',
    description: 'Retrieves a specific selling entry with all related data.',
  })
  async getSellingById(@Param('id') entryId: string, @Req() req: Request) {
    return this.service.getSellingById(entryId, req.adminId);
  }

  // ✅ UPDATE PURCHASE ENTRY
  @Put('purchase/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Update Purchase Entry',
    description:
      'Updates an existing purchase entry. Automatically recalculates currency relations and general ledger entries.',
  })
  @ApiBody({ type: UpdatePurchaseDto })
  async updatePurchase(
    @Param('id') entryId: string,
    @Body() dto: UpdatePurchaseDto,
    @Req() req: Request,
  ) {
    return this.service.updatePurchase(entryId, dto, req.adminId);
  }

  // ✅ UPDATE SELLING ENTRY
  @Put('selling/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOperation({
    summary: 'Update Selling Entry',
    description:
      'Updates an existing selling entry. Automatically recalculates currency relations and general ledger entries.',
  })
  @ApiBody({ type: UpdateSellingDto })
  async updateSelling(
    @Param('id') entryId: string,
    @Body() dto: UpdateSellingDto,
    @Req() req: Request,
  ) {
    return this.service.updateSelling(entryId, dto, req.adminId);
  }
}
