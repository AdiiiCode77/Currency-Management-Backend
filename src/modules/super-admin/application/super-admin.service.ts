import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';
import { SuperAdminEntity } from '../domain/entities/super-admin.entity';
import { AdminPaymentEntity } from '../domain/entities/admin-payment.entity';
import { UserEntity } from '../../users/domain/entities/user.entity';
import { UserProfileEntity } from '../../users/domain/entities/user-profiles.entity';
import { AdminEntity } from '../../users/domain/entities/admin.entity';
import { SuperAdminLoginDto } from '../domain/dto/super-admin-login.dto';
import { CreateAdminDto } from '../domain/dto/create-admin.dto';
import { UpdateAdminDto } from '../domain/dto/update-admin.dto';
import { CreatePaymentDto } from '../domain/dto/create-payment.dto';
import { UpdatePaymentDto } from '../domain/dto/update-payment.dto';
import { FilterAdminsDto } from '../domain/dto/filter-admins.dto';
import { FilterUsersDto } from '../domain/dto/filter-users.dto';
import { BlockUserDto } from '../domain/dto/block-user.dto';

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
    private readonly jwtService: JwtService,
  ) {}

  // Seed Default Super Admin (runs on startup)
  async seedDefaultSuperAdmin(): Promise<void> {
    try {
      // Check if super admin already exists
      const existingSuperAdmin = await this.superAdminRepository.findOne({
        where: { email: 'superadmin@dirham.com' },
      });

      if (existingSuperAdmin) {
        console.log('✅ Super Admin already exists. Skipping seed.');
        return;
      }

      // Create default super admin
      const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);

      const superAdmin = this.superAdminRepository.create({
        id: uuidV4(),
        email: 'superadmin@dirham.com',
        password: hashedPassword,
        name: 'Super Administrator',
        phone: '+923001234567',
        is_active: true,
      });

      await this.superAdminRepository.save(superAdmin);

      console.log('✅ Super Admin seeded successfully!');
      console.log('📧 Email: superadmin@dirham.com');
      console.log('🔑 Password: SuperAdmin@123');
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

  async createAdmin(createAdminDto: CreateAdminDto) {
    const { email, password, name, phone, type } = createAdminDto;

    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      id: uuidV4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone,
      email_is_verified: true,
      block_status: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Create user profile
    const userProfile = this.userProfileRepository.create({
      id: uuidV4(),
      user_id: savedUser.id,
    });

    const savedUserProfile = await this.userProfileRepository.save(userProfile);

    // Create admin
    const admin = this.adminRepository.create({
      id: uuidV4(),
      type,
      user_profile_id: savedUserProfile.id,
    });

    await this.adminRepository.save(admin);

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
  }

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
}
