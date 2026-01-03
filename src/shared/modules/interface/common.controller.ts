import { Controller, Get, Param, Query, Req, UseGuards, Delete, BadRequestException } from '@nestjs/common';
import { CommonService } from '../application/common.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';
import { Request } from 'express';

@Controller('api/v1/customers')
export class CommonController {
  constructor(private customerService: CommonService) {}

  @Get('dropdown')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAllForDropdown(@Req() req: Request) {
    return  await this.customerService.getAllCustomersForDropdown(req.adminId);
  }

  @Get('banks/dropdown')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAllBanksForDropdown(@Req() req: Request) {
    return await this.customerService.getAllBankForDropdown(req.adminId);
  }

  @Get('userAndbanksdropdown')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAllbanksansUsersForDropdown(@Req() req: Request) {
    return  await this.customerService.getAllCustomersandBanksForDropdown(req.adminId);
  }

  @Get('currency/account/:cId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async CurrencyAccounts(@Req() req: Request, @Param('cId') cid: string) {
    return await this.customerService.getAllCurrencyAccountsForDropdown(req.adminId, cid);
  }
  
  @Get('currency/dropdown')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getCurrencyofUser(@Req() req: Request) {
    return await this.customerService.getCurrencyofUser(req.adminId);
  }

  @Get('chq-ref/dropdown')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getRefBanks(@Req() req: Request) {
    return await this.customerService.getRefBanks(req.adminId);
  }

  /**
   * Unified endpoint for all account types dropdown
   * Combines customer, bank, and currency accounts
   * Returns ALL currency accounts regardless of currency type
   * @route GET /api/v1/customers/accounts/all-dropdown
   * @returns Array of accounts with type information
   */
  @Get('accounts/all-dropdown')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getAllAccountsForDropdown(
    @Req() req: Request,
  ) {
    if (!req.adminId) {
      throw new BadRequestException(
        'Admin ID is required. Please ensure you are properly authenticated.',
      );
    }
    return await this.customerService.getAllAccountsForDropdown(
      req.adminId,
    );
  }

  /**
   * Clear cached accounts for optimization
   * Use after creating/updating/deleting accounts
   * @route DELETE /api/v1/customers/cache/clear-accounts
   */
  @Delete('cache/clear-accounts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async clearAccountsCache(@Req() req: Request) {
    if (!req.adminId) {
      throw new BadRequestException(
        'Admin ID is required. Please ensure you are properly authenticated.',
      );
    }
    await this.customerService.clearAccountsCache(req.adminId);
    return {
      success: true,
      message: 'Account cache cleared successfully',
    };
  }

  @Get('get-module-by-id')
  async getModuleById(
    @Query('module') module: string,
    @Query('id') id: string,
  ) {
    return this.customerService.getModuleById(module, id);
  }
}
