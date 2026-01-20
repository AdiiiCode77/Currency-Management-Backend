import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
import { DashboardService } from '../application/dashboard.service';
import { CreateChqInwardEntryDto } from '../domain/dto/create-chq-inward-entry.dto';
import { Request } from 'express';
import { CreateChqOutwardEntryDto } from '../domain/dto/create-chq-outward-entry.dto';

@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Post('chq-inward/create')
  @ApiOperation({ summary: 'Create a Cheque Inward Entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBody({
    type: CreateChqInwardEntryDto,
    examples: {
      sample: {
        value: {
          entryDate: '2025-01-10',
          chqDate: '2025-01-11',
          postingDate: '2025-01-12',
          fromAccountId: 'uuid-ac-1',
          toAccountId: 'uuid-ac-2',
          amount: 15000,
          chqBankRefId: 'uuid-bank-1',
          chqNumber: 'CHQ-445566',
        },
      },
    },
  })
  async createChqInwardEntry(
    @Req() req: Request,
    @Body() dto: CreateChqInwardEntryDto,
  ) {
    return this.dashboardService.createChqInwardEntry(dto, req.adminId);
  }

  @Post('chq-inward/multiple')
  @ApiOperation({
    summary: 'Create multiple Cheque Inward Entries',
    description:
      'This API allows you to create multiple cheque inward entries in a single request. It is optimized for large batch operations and scalable for large databases.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBody({
    description: 'Array of cheque inward entries to create in batch',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(CreateChqInwardEntryDto) },
      example: [
        {
          entryDate: '2025-01-10',
          chqDate: '2025-01-11',
          postingDate: '2025-01-12',
          fromAccountId: 'f5180a17-2449-4c88-b86e-041ee160a9c8',
          toAccountId: 'f5180a17-2449-4c88-b86e-041ee160a9c8',
          chqBankRefId: '070bcff4-c09a-465f-bc17-5a1bc541281f',
          amount: 15000,
          chqNumber: 'CHQ-77881',
        },
        {
          entryDate: '2025-01-10',
          chqDate: '2025-01-15',
          postingDate: '2025-01-16',
          fromAccountId: 'f5180a17-2449-4c88-b86e-041ee160a9c8',
          toAccountId: 'f5180a17-2449-4c88-b86e-041ee160a9c8',
          chqBankRefId: '070bcff4-c09a-465f-bc17-5a1bc541281f',
          amount: 25000,
          chqNumber: 'CHQ-99221',
        },
      ],
    },
  })
  async createMultiple(
    @Body() body: CreateChqInwardEntryDto[],
    @Req() req: Request,
  ) {
    return this.dashboardService.createMultipleChqInwardEntries(
      body,
      req.adminId,
    );
  }

  @Post('chq-outward/create')
  @ApiOperation({
    summary: 'Create a Cheque Outward Entry',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBody({ type: CreateChqOutwardEntryDto })
  createOne(@Body() body: CreateChqOutwardEntryDto, @Req() req: any) {
    return this.dashboardService.createChqOutwardEntry(body, req.adminId);
  }

  @Post('chq-outward/multiple')
  @ApiOperation({
    summary: 'Create multiple Cheque Outward Entries',
    description:
      'Efficient batch creation optimised for large databases. Accepts an array of cheque outward entries.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBody({
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(CreateChqOutwardEntryDto) },
    },
  })
  createMultipleOutward(
    @Body() body: CreateChqOutwardEntryDto[],
    @Req() req: any,
  ) {
    return this.dashboardService.createMultipleChqOutwardEntries(
      body,
      req.adminId,
    );
  }

  @Get('chq-outward/all')
  @ApiOperation({
    summary: 'Get all Cheque Outward Entries for this admin',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  getAllOutwardEntry(@Req() req: any) {
    return this.dashboardService.getAllChqOutwardEntries(req.adminId);
  }

  @Get('chq-inward/all')
  @ApiOperation({
    summary: 'Get all Cheque Inward Entries for this admin',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAll(@Req() req: Request) {
    return this.dashboardService.getAllChqInwardEntries(req.adminId);
  }
}
