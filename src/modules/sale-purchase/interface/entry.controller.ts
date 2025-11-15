import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SalePurchaseService } from '../application/entry.service';
import { CreatePurchaseDto } from '../domain/dto/purchase-create.dto';
import { CreateSellingDto } from '../domain/dto/selling-create.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
import { Request } from 'express';

@ApiTags('Sale & Purchase Entries')
@Controller('sale-purchase')
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
  @ApiBody({
    type: CreatePurchaseDto,
    description:
      'Payload required to create a Purchase Entry. Ensures PKR amount matches (currencyAmount * rate).',
  })
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
}
