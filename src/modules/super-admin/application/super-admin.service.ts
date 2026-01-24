import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';
import { SuperAdminEntity } from '../domain/entities/super-admin.entity';
import { AdminPaymentEntity } from '../domain/entities/admin-payment.entity';
import { UserEntity } from '../../users/domain/entities/user.entity';
import { UserProfileEntity } from '../../users/domain/entities/user-profiles.entity';
import { AdminEntity } from '../../users/domain/entities/admin.entity';
import { UserTypeEntity } from '../../users/domain/entities/user-type.entity';
import { SuperAdminLoginDto } from '../domain/dto/super-admin-login.dto';
import { CreateAdminDto } from '../domain/dto/create-admin.dto';
import { UpdateAdminDto } from '../domain/dto/update-admin.dto';
import { CreatePaymentDto } from '../domain/dto/create-payment.dto';
import { UpdatePaymentDto } from '../domain/dto/update-payment.dto';
import { FilterAdminsDto } from '../domain/dto/filter-admins.dto';
import { FilterUsersDto } from '../domain/dto/filter-users.dto';
import { BlockUserDto } from '../domain/dto/block-user.dto';
import { DashboardStatsDto } from '../domain/dto/dashboard-stats.dto';
import { PaymentStatus } from '../domain/entities/admin-payment.entity';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(SuperAdminEntity)
    private superAdminRepository: Repository<SuperAdminEntity>,
    @InjectRepository(AdminPaymentEntity)
    private adminPaymentRepository: Repository<AdminPaymentEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserProfileEntity)
    private userProfileRepository: Repository<UserProfileEntity>,
    @InjectRepository(AdminEntity)
    private adminRepository: Repository<AdminEntity>,
    @InjectRepository(UserTypeEntity)
    private userTypeRepository: Repository<UserTypeEntity>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  // Seed Default Super Admin (runs on startup)
  async seedDefaultSuperAdmin(): Promise<void> {
    try {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@dirham.com';
      const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
      const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';
      const superAdminPhone = process.env.SUPER_ADMIN_PHONE || '+923001234567';

      // Check if super admin already exists
      const existingSuperAdmin = await this.superAdminRepository.findOne({
        where: { email: superAdminEmail },
      });

      if (existingSuperAdmin) {
        console.log('✅ Super Admin already exists. Skipping seed.');
        return;
      }

      // Create default super admin
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

      const superAdmin = this.superAdminRepository.create({
        id: uuidV4(),
        email: superAdminEmail,
        password: hashedPassword,
        name: superAdminName,
        phone: superAdminPhone,
        is_active: true,
      });

      await this.superAdminRepository.save(superAdmin);

      console.log('✅ Super Admin seeded successfully!');
      console.log('📧 Email:', superAdminEmail);
      console.log('⚠️  Please change the password after first login!');
    } catch (error) {
      console.error('❌ Error seeding super admin:', error.message);
    }
  }

  // Super Admin Login
  async login(loginDto: SuperAdminLoginDto) {
    const { email, password } = loginDto;

    const superAdmin = await this.superAdminRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!superAdmin.is_active) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, superAdmin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: superAdmin.id,
      email: superAdmin.email,
      role: 'super-admin',
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      access_token: token,
      super_admin: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        phone: superAdmin.phone,
      },
    };
  }
// Create Admin
  async createAdmin(createAdminDto: CreateAdminDto) {
    const { email, password, name, phone, type } = createAdminDto;

    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Use transaction to ensure all operations succeed or all fail
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Get or create "admin" user type
      let adminUserType = await queryRunner.manager.findOne(UserTypeEntity, {
        where: { name: 'admin' },
      });

      if (!adminUserType) {
        adminUserType = queryRunner.manager.create(UserTypeEntity, {
          id: uuidV4(),
          name: 'admin',
        });
        adminUserType = await queryRunner.manager.save(adminUserType);
      }

      // Create user
      const user = queryRunner.manager.create(UserEntity, {
        id: uuidV4(),
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        email_is_verified: true,
        block_status: false,
      });

      const savedUser = await queryRunner.manager.save(user);

      // Create user profile with user_type_id
      const userProfile = queryRunner.manager.create(UserProfileEntity, {
        id: uuidV4(),
        user_id: savedUser.id,
        user_type_id: adminUserType.id,
      });

      const savedUserProfile = await queryRunner.manager.save(userProfile);

      // Create admin
      const admin = queryRunner.manager.create(AdminEntity, {
        id: uuidV4(),
        type: 'admin',
        user_profile_id: savedUserProfile.id,
      });

      await queryRunner.manager.save(admin);

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        message: 'Admin created successfully',
        admin: {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          phone: savedUser.phone,
          type,
        },
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      
      // Re-throw the error with a user-friendly message
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException('Admin with this email already exists');
      }
      
      throw new BadRequestException(
        `Failed to create admin: ${error.message}`,
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  // Get All Admins with Filtering and Pagination
  async getAllAdmins(filterDto: FilterAdminsDto) {
    const { search, type, block_status, page = 1, limit = 10 } = filterDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user_profiles', 'profile', 'profile.user_id = user.id')
      .leftJoinAndSelect('admins', 'admin', 'admin.user_profile_id = profile.id')
      .where('admin.id IS NOT NULL');

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('admin.type = :type', { type });
    }

    if (block_status !== undefined) {
      queryBuilder.andWhere('user.block_status = :block_status', {
        block_status,
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    const adminsWithDetails = await Promise.all(
      users.map(async (user) => {
        const profile = await this.userProfileRepository.findOne({
          where: { user_id: user.id },
        });

        const admin = profile
          ? await this.adminRepository.findOne({
              where: { user_profile_id: profile.id },
            })
          : null;

        const payments = admin
          ? await this.adminPaymentRepository.find({
              where: { admin_id: user.id },
              order: { createdAt: 'DESC' },
            })
          : [];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          block_status: user.block_status,
          type: admin?.type,
          payments: payments.map((p) => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            due_date: p.due_date,
            paid_date: p.paid_date,
            description: p.description,
          })),
          createdAt: user.createdAt,
        };
      }),
    );

    return {
      data: adminsWithDetails,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get Single Admin Details
  async getAdminById(adminId: string) {
    const user = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!user) {
      throw new NotFoundException('Admin not found');
    }

    const profile = await this.userProfileRepository.findOne({
      where: { user_id: user.id },
    });

    if (!profile) {
      throw new NotFoundException('Admin profile not found');
    }

    const admin = await this.adminRepository.findOne({
      where: { user_profile_id: profile.id },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Get payment info
    const payments = await this.adminPaymentRepository.find({
      where: { admin_id: user.id },
      order: { createdAt: 'DESC' },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      block_status: user.block_status,
      type: admin.type,
      account_balance: user.account_balance,
      balance_in: user.balance_in,
      email_is_verified: user.email_is_verified,
      last_login: user.last_login,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        due_date: p.due_date,
        paid_date: p.paid_date,
        description: p.description,
        createdAt: p.createdAt,
      })),
    };
  }

  // Update Admin
  async updateAdmin(adminId: string, updateDto: UpdateAdminDto) {
    const user = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!user) {
      throw new NotFoundException('Admin not found');
    }

    // Update user details
    if (updateDto.name) user.name = updateDto.name;
    if (updateDto.phone) user.phone = updateDto.phone;
    if (updateDto.block_status !== undefined)
      user.block_status = updateDto.block_status;

    await this.userRepository.save(user);

    // Update admin type if provided
    if (updateDto.type) {
      const profile = await this.userProfileRepository.findOne({
        where: { user_id: user.id },
      });

      if (profile) {
        const admin = await this.adminRepository.findOne({
          where: { user_profile_id: profile.id },
        });

        if (admin) {
          admin.type = updateDto.type;
          await this.adminRepository.save(admin);
        }
      }
    }

    return {
      message: 'Admin updated successfully',
      admin: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        block_status: user.block_status,
      },
    };
  }

  // Delete Admin
  async deleteAdmin(adminId: string) {
    const user = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!user) {
      throw new NotFoundException('Admin not found');
    }

    const profile = await this.userProfileRepository.findOne({
      where: { user_id: user.id },
    });

    if (profile) {
      const admin = await this.adminRepository.findOne({
        where: { user_profile_id: profile.id },
      });

      if (admin) {
        // Delete payments first
        await this.adminPaymentRepository.delete({ admin_id: adminId });
        // Delete admin
        await this.adminRepository.delete(admin.id);
      }

      // Delete profile
      await this.userProfileRepository.delete(profile.id);
    }

    // Delete user
    await this.userRepository.delete(user.id);

    return {
      message: 'Admin deleted successfully',
    };
  }

  // Create Payment for Admin
  async createPayment(createPaymentDto: CreatePaymentDto) {
    const { admin_id, amount, status, description, due_date } =
      createPaymentDto;

    // Verify admin exists
    const admin = await this.userRepository.findOne({
      where: { id: admin_id },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const payment = this.adminPaymentRepository.create({
      id: uuidV4(),
      admin_id,
      amount,
      status,
      description,
      due_date: due_date ? new Date(due_date) : null,
    });

    const savedPayment = await this.adminPaymentRepository.save(payment);

    return {
      message: 'Payment created successfully',
      payment: {
        id: savedPayment.id,
        admin_id: savedPayment.admin_id,
        amount: savedPayment.amount,
        status: savedPayment.status,
        description: savedPayment.description,
        due_date: savedPayment.due_date,
      },
    };
  }

  // Update Payment Status
  async updatePayment(paymentId: string, updateDto: UpdatePaymentDto) {
    const payment = await this.adminPaymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (updateDto.amount !== undefined) payment.amount = updateDto.amount;
    if (updateDto.status) payment.status = updateDto.status;
    if (updateDto.description) payment.description = updateDto.description;
    if (updateDto.due_date) payment.due_date = new Date(updateDto.due_date);
    if (updateDto.paid_date) payment.paid_date = new Date(updateDto.paid_date);

    const updatedPayment = await this.adminPaymentRepository.save(payment);

    return {
      message: 'Payment updated successfully',
      payment: {
        id: updatedPayment.id,
        admin_id: updatedPayment.admin_id,
        amount: updatedPayment.amount,
        status: updatedPayment.status,
        description: updatedPayment.description,
        due_date: updatedPayment.due_date,
        paid_date: updatedPayment.paid_date,
      },
    };
  }

  // Get All Payments for an Admin
  async getAdminPayments(adminId: string) {
    const payments = await this.adminPaymentRepository.find({
      where: { admin_id: adminId },
      order: { createdAt: 'DESC' },
    });

    return {
      data: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        description: p.description,
        due_date: p.due_date,
        paid_date: p.paid_date,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    };
  }

  // Delete Payment
  async deletePayment(paymentId: string) {
    const payment = await this.adminPaymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    await this.adminPaymentRepository.delete(paymentId);

    return {
      message: 'Payment deleted successfully',
    };
  }

  // Get All Users with Filtering and Pagination
  async getAllUsers(filterDto: FilterUsersDto) {
    const { search, block_status, page = 1, limit = 10 } = filterDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user_profiles', 'profile', 'profile.user_id = user.id')
      .leftJoinAndSelect('admins', 'admin', 'admin.user_profile_id = profile.id')
      .where('admin.id IS NULL');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply block status filter
    if (block_status !== undefined) {
      queryBuilder.andWhere('user.block_status = :block_status', {
        block_status,
      });
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        block_status: user.block_status,
        account_balance: user.account_balance,
        balance_in: user.balance_in,
        email_is_verified: user.email_is_verified,
        last_login: user.last_login,
        createdAt: user.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get User Profile by ID
  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.userProfileRepository.findOne({
      where: { user_id: user.id },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      block_status: user.block_status,
      account_balance: user.account_balance,
      balance_in: user.balance_in,
      email_is_verified: user.email_is_verified,
      last_login: user.last_login,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: profile
        ? {
            id: profile.id,
            user_id: profile.user_id,
          }
        : null,
    };
  }

  // Block/Unblock User
  async blockUser(userId: string, blockDto: BlockUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.block_status = blockDto.block_status;
    await this.userRepository.save(user);

    return {
      message: `User ${blockDto.block_status ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        block_status: user.block_status,
      },
    };
  }

  // ===================== DASHBOARD & ANALYTICS =====================

  // Get Dashboard Overview Stats
  async getDashboardStats() {
    // Total admins count
    const totalAdmins = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user_profiles', 'profile', 'profile.user_id = user.id')
      .leftJoin('admins', 'admin', 'admin.user_profile_id = profile.id')
      .where('admin.id IS NOT NULL')
      .getCount();

    // Active admins (not blocked)
    const activeAdmins = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user_profiles', 'profile', 'profile.user_id = user.id')
      .leftJoin('admins', 'admin', 'admin.user_profile_id = profile.id')
      .where('admin.id IS NOT NULL')
      .andWhere('user.block_status = :status', { status: false })
      .getCount();

    // Blocked admins
    const blockedAdmins = totalAdmins - activeAdmins;

    // Payment statistics
    const totalPayments = await this.adminPaymentRepository.count();

    const pendingPayments = await this.adminPaymentRepository.count({
      where: { status: PaymentStatus.PENDING },
    });

    const paidPayments = await this.adminPaymentRepository.count({
      where: { status: PaymentStatus.PAID },
    });

    const overduePayments = await this.adminPaymentRepository.count({
      where: { status: PaymentStatus.OVERDUE },
    });

    // Total revenue (paid payments)
    const paidPaymentsData = await this.adminPaymentRepository.find({
      where: { status: PaymentStatus.PAID },
    });

    const totalRevenue = paidPaymentsData.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    // Pending revenue
    const pendingPaymentsData = await this.adminPaymentRepository.find({
      where: { status: PaymentStatus.PENDING },
    });

    const pendingRevenue = pendingPaymentsData.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    // Overdue revenue
    const overduePaymentsData = await this.adminPaymentRepository.find({
      where: { status: PaymentStatus.OVERDUE },
    });

    const overdueRevenue = overduePaymentsData.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    // Current month stats
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    const currentMonthPayments = await this.adminPaymentRepository
      .createQueryBuilder('payment')
      .where('payment.created_at >= :start', { start: firstDayOfMonth })
      .andWhere('payment.created_at <= :end', { end: lastDayOfMonth })
      .getMany();

    const currentMonthRevenue = currentMonthPayments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const currentMonthPending = currentMonthPayments.filter(
      (p) => p.status === PaymentStatus.PENDING,
    ).length;

    return {
      admins: {
        total: totalAdmins,
        active: activeAdmins,
        blocked: blockedAdmins,
      },
      payments: {
        total: totalPayments,
        pending: pendingPayments,
        paid: paidPayments,
        overdue: overduePayments,
      },
      revenue: {
        total: Number(totalRevenue.toFixed(2)),
        pending: Number(pendingRevenue.toFixed(2)),
        overdue: Number(overdueRevenue.toFixed(2)),
      },
      currentMonth: {
        revenue: Number(currentMonthRevenue.toFixed(2)),
        pendingPayments: currentMonthPending,
        totalPayments: currentMonthPayments.length,
      },
    };
  }

  // Get Monthly Payment Stats
  async getMonthlyStats(statsDto: DashboardStatsDto) {
    const { year, month } = statsDto;
    const currentYear = year || new Date().getFullYear().toString();
    const targetMonth = month ? parseInt(month.split('-')[1]) : null;

    let monthlyData = [];

    if (targetMonth) {
      // Get specific month data
      const monthDate = new Date(parseInt(currentYear), targetMonth - 1, 1);
      const firstDay = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1,
      );
      const lastDay = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
      );

      const payments = await this.adminPaymentRepository
        .createQueryBuilder('payment')
        .where('payment.created_at >= :start', { start: firstDay })
        .andWhere('payment.created_at <= :end', { end: lastDay })
        .getMany();

      const paid = payments.filter((p) => p.status === PaymentStatus.PAID);
      const pending = payments.filter((p) => p.status === PaymentStatus.PENDING);
      const overdue = payments.filter((p) => p.status === PaymentStatus.OVERDUE);

      monthlyData.push({
        month: `${currentYear}-${targetMonth.toString().padStart(2, '0')}`,
        totalPayments: payments.length,
        paidPayments: paid.length,
        pendingPayments: pending.length,
        overduePayments: overdue.length,
        totalRevenue: Number(
          paid.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2),
        ),
        pendingRevenue: Number(
          pending.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2),
        ),
        overdueRevenue: Number(
          overdue.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2),
        ),
      });
    } else {
      // Get all 12 months data for the year
      for (let m = 0; m < 12; m++) {
        const firstDay = new Date(parseInt(currentYear), m, 1);
        const lastDay = new Date(parseInt(currentYear), m + 1, 0);

        const payments = await this.adminPaymentRepository
          .createQueryBuilder('payment')
          .where('payment.created_at >= :start', { start: firstDay })
          .andWhere('payment.created_at <= :end', { end: lastDay })
          .getMany();

        const paid = payments.filter((p) => p.status === PaymentStatus.PAID);
        const pending = payments.filter(
          (p) => p.status === PaymentStatus.PENDING,
        );
        const overdue = payments.filter(
          (p) => p.status === PaymentStatus.OVERDUE,
        );

        monthlyData.push({
          month: `${currentYear}-${(m + 1).toString().padStart(2, '0')}`,
          totalPayments: payments.length,
          paidPayments: paid.length,
          pendingPayments: pending.length,
          overduePayments: overdue.length,
          totalRevenue: Number(
            paid.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2),
          ),
          pendingRevenue: Number(
            pending.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2),
          ),
          overdueRevenue: Number(
            overdue.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2),
          ),
        });
      }
    }

    return {
      year: currentYear,
      data: monthlyData,
    };
  }

  // Get Payment Cards/Summary by Status
  async getPaymentCards() {
    const now = new Date();

    // Pending Payments
    const pendingPayments = await this.adminPaymentRepository.find({
      where: { status: PaymentStatus.PENDING },
      order: { due_date: 'ASC' },
    });

    const pendingTotal = pendingPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    // Paid Payments (This Month)
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const paidThisMonth = await this.adminPaymentRepository
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.paid_date >= :start', { start: firstDayOfMonth })
      .getMany();

    const paidTotal = paidThisMonth.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    // Overdue Payments
    const overduePayments = await this.adminPaymentRepository.find({
      where: { status: PaymentStatus.OVERDUE },
      order: { due_date: 'ASC' },
    });

    const overdueTotal = overduePayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    // Upcoming Due (Next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcomingPayments = await this.adminPaymentRepository
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status: PaymentStatus.PENDING })
      .andWhere('payment.due_date >= :now', { now })
      .andWhere('payment.due_date <= :nextWeek', { nextWeek })
      .orderBy('payment.due_date', 'ASC')
      .getMany();

    const upcomingTotal = upcomingPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    return {
      pending: {
        count: pendingPayments.length,
        total: Number(pendingTotal.toFixed(2)),
        payments: pendingPayments.slice(0, 5).map((p) => ({
          id: p.id,
          admin_id: p.admin_id,
          amount: p.amount,
          due_date: p.due_date,
          description: p.description,
        })),
      },
      paid: {
        count: paidThisMonth.length,
        total: Number(paidTotal.toFixed(2)),
        month: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
      },
      overdue: {
        count: overduePayments.length,
        total: Number(overdueTotal.toFixed(2)),
        payments: overduePayments.slice(0, 5).map((p) => ({
          id: p.id,
          admin_id: p.admin_id,
          amount: p.amount,
          due_date: p.due_date,
          description: p.description,
        })),
      },
      upcoming: {
        count: upcomingPayments.length,
        total: Number(upcomingTotal.toFixed(2)),
        payments: upcomingPayments.map((p) => ({
          id: p.id,
          admin_id: p.admin_id,
          amount: p.amount,
          due_date: p.due_date,
          description: p.description,
        })),
      },
    };
  }

  // Get Admin-wise Payment Breakdown
  async getAdminPaymentBreakdown(statsDto: DashboardStatsDto) {
    const { page = 1, limit = 10 } = statsDto;

    // Get all admins with their profiles
    const adminsQuery = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user_profiles', 'profile', 'profile.user_id = user.id')
      .leftJoinAndSelect('admins', 'admin', 'admin.user_profile_id = profile.id')
      .where('admin.id IS NOT NULL')
      .skip((page - 1) * limit)
      .take(limit);

    const [admins, total] = await adminsQuery.getManyAndCount();

    const adminBreakdown = await Promise.all(
      admins.map(async (admin) => {
        const payments = await this.adminPaymentRepository.find({
          where: { admin_id: admin.id },
        });

        const paid = payments.filter((p) => p.status === PaymentStatus.PAID);
        const pending = payments.filter(
          (p) => p.status === PaymentStatus.PENDING,
        );
        const overdue = payments.filter(
          (p) => p.status === PaymentStatus.OVERDUE,
        );

        return {
          admin_id: admin.id,
          admin_name: admin.name,
          admin_email: admin.email,
          total_payments: payments.length,
          paid_count: paid.length,
          pending_count: pending.length,
          overdue_count: overdue.length,
          total_paid: Number(
            paid.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2),
          ),
          total_pending: Number(
            pending.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2),
          ),
          total_overdue: Number(
            overdue.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2),
          ),
          last_payment_date:
            paid.length > 0
              ? paid.sort(
                  (a, b) =>
                    new Date(b.paid_date).getTime() -
                    new Date(a.paid_date).getTime(),
                )[0].paid_date
              : null,
        };
      }),
    );

    return {
      data: adminBreakdown,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
