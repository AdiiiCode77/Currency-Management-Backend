import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SalePurchaseService } from '../application/entry.service';
import { CreatePurchaseDto } from '../domain/dto/purchase-create.dto';
import { CreateSellingDto } from '../domain/dto/selling-create.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
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
}
