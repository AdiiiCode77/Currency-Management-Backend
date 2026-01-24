import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuperAdminService } from '../application/super-admin.service';
import { SuperAdminLoginDto } from '../domain/dto/super-admin-login.dto';
import { CreateAdminDto } from '../domain/dto/create-admin.dto';
import { UpdateAdminDto } from '../domain/dto/update-admin.dto';
import { CreatePaymentDto } from '../domain/dto/create-payment.dto';
import { UpdatePaymentDto } from '../domain/dto/update-payment.dto';
import { FilterAdminsDto } from '../domain/dto/filter-admins.dto';
import { FilterUsersDto } from '../domain/dto/filter-users.dto';
import { FilterAllPaymentsDto } from '../domain/dto/filter-all-payments.dto';
import { BlockUserDto } from '../domain/dto/block-user.dto';
import { DashboardStatsDto } from '../domain/dto/dashboard-stats.dto';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // ===================== AUTHENTICATION =====================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: SuperAdminLoginDto) {
    return this.superAdminService.login(loginDto);
  }

  // ===================== ADMIN MANAGEMENT =====================

  @Post('admins')
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.superAdminService.createAdmin(createAdminDto);
  }

  @Get('admins')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async getAllAdmins(@Query() filterDto: FilterAdminsDto) {
    return this.superAdminService.getAllAdmins(filterDto);
  }

  @Get('admins/:id')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async getAdminById(@Param('id') id: string) {
    return this.superAdminService.getAdminById(id);
  }

  @Put('admins/:id')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdminDto,
  ) {
    return this.superAdminService.updateAdmin(id, updateDto);
  }

  @Delete('admins/:id')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async deleteAdmin(@Param('id') id: string) {
    return this.superAdminService.deleteAdmin(id);
  }

  // ===================== PAYMENT MANAGEMENT =====================

  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.superAdminService.createPayment(createPaymentDto);
  }

  @Get('payments')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async getAllPayments(@Query() filterDto: FilterAllPaymentsDto) {
    return this.superAdminService.getAllPayments(filterDto);
  }

  @Get('payments/admin/:adminId')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async getAdminPayments(@Param('adminId') adminId: string) {
    return this.superAdminService.getAdminPayments(adminId);
  }

  @Put('payments/:id')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async updatePayment(
    @Param('id') id: string,
    @Body() updateDto: UpdatePaymentDto,
  ) {
    return this.superAdminService.updatePayment(id, updateDto);
  }

  @Delete('payments/:id')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async deletePayment(@Param('id') id: string) {
    return this.superAdminService.deletePayment(id);
  }

  // ===================== USER MANAGEMENT =====================

  @Get('users')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async getAllUsers(@Query() filterDto: FilterUsersDto) {
    return this.superAdminService.getAllUsers(filterDto);
  }

  @Get('users/:id')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async getUserProfile(@Param('id') id: string) {
    return this.superAdminService.getUserProfile(id);
  }

  @Put('users/:id/block')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async blockUser(@Param('id') id: string, @Body() blockDto: BlockUserDto) {
    return this.superAdminService.blockUser(id, blockDto);
  }

  // ===================== DASHBOARD & ANALYTICS =====================

  @Get('dashboard/stats')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async getDashboardStats() {
    return this.superAdminService.getDashboardStats();
  }

  @Get('dashboard/monthly-stats')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async getMonthlyStats(@Query() statsDto: DashboardStatsDto) {
    return this.superAdminService.getMonthlyStats(statsDto);
  }

  @Get('dashboard/payment-cards')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async getPaymentCards() {
    return this.superAdminService.getPaymentCards();
  }

  @Get('dashboard/admin-breakdown')
  // @UseGuards(JwtGuard, IsSuperAdminGuard)
  async getAdminPaymentBreakdown(@Query() statsDto: DashboardStatsDto) {
    return this.superAdminService.getAdminPaymentBreakdown(statsDto);
  }
}
