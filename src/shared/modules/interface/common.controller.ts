import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
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

  @Get('get-module-by-id')
  async getModuleById(
    @Query('module') module: string,
    @Query('id') id: string,
  ) {
    return this.customerService.getModuleById(module, id);
  }
}
