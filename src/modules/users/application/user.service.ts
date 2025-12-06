import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Search,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../domain/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { AdminEntity } from '../domain/entities/admin.entity';
import { IChangePassword, IUpdateProfile } from '../domain/types/user.types';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import bcrypt from 'bcrypt';
import { UserProfileEntity } from '../domain/entities/user-profiles.entity';
import { UserTypeEntity } from '../domain/entities/user-type.entity';
import { CustomerEntity } from '../domain/entities/customer.entity';
import { PaginatedUsersResponse } from 'src/modules/admin/domain/types/paginatedUserType';
import { FilterUserDto } from 'src/modules/admin/domain/dtos/filter-user.dto';
import { PaginationDto } from 'src/shared/modules/dtos/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserProfileEntity)
    private userProfileRepository: Repository<UserProfileEntity>,
    @InjectRepository(UserTypeEntity)
    private userTypeEntity: Repository<UserTypeEntity>,

    @InjectRepository(AdminEntity)
    private adminRepository: Repository<AdminEntity>,
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
  ) {}
  async updateProfile(body: IUpdateProfile) {
    const user = await this.userRepository.findOneBy({
      id: body.userId,
    });

    if (!user) {
      throw new NotFoundException(['No such user exists with this id']);
    }

    const updatedBody: QueryDeepPartialEntity<UserEntity> = {};
    if (body?.name) {
      updatedBody.name = body.name;
    }

    if (body?.email) {
      if (body?.email !== user?.email) {
        const emailExists = await this.userRepository.findOneBy({
          email: body.email,
        });

        if (emailExists) {
          throw new ConflictException([
            'Another user already exists with this email',
          ]);
        }
      }
      updatedBody.email = body.email;
    }

    if (body?.phone) {
      if (body?.phone !== user?.phone) {
        const phoneExists = await this.userRepository.findOneBy({
          phone: body.phone,
        });

        if (phoneExists) {
          throw new ConflictException([
            'Another user already exists with this phone number',
          ]);
        }
      }
      updatedBody.phone = body.phone;
    }

    const updated = await this.userRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set(updatedBody)
      .where('id = :id', { id: body.userId })
      .returning([
        'id',
        'name',
        'email',
        'phone',
        'email_is_verified',
        'created_at',
        'updated_at',
      ])
      .execute();

    return { user: updated.raw[0] };
  }

  async changePassword(body: IChangePassword) {
    const user = await this.userRepository.findOneBy({
      id: body.userId,
    });

    if (!user) {
      throw new NotFoundException(['No such user exists with this id']);
    }

    const match = await bcrypt.compare(body.previous_password, user.password);
    if (!match) {
      throw new ForbiddenException(['Previous password is incorrect']);
    }

    const hashedPassword = await bcrypt.hash(body.new_password, 10);

    await this.userRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        password: hashedPassword,
      })
      .where('id = :id', { id: body.userId })

      .execute();

    return { message: 'Password updated successfully' };
  }

  // for generic user table check (for all user types)
  async findUserById(userId: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException(['User doesnot exists with this id']);
    }

    return { user };
  }

  async findUserProfile(
    userId: string,
    user_type_id: string,
    user_type_alias: string,
  ) {
    const userProfile = await this.userProfileRepository.findOneBy({
      user_id: userId,
      user_type_id: user_type_id,
    });

    if (!userProfile) {
      throw new NotFoundException([
        'No Matching Profile Id exists with this user Type Id for : ' +
          user_type_alias,
      ]);
    }

    return { userProfile };
  }

  async findUserTypeByName(name: string) {
    const userType = await this.userTypeEntity.findOneBy({
      name: name,
    });

    if (!userType) {
      throw new NotFoundException([
        'No such user Type/Role Found in our system : ' + name,
      ]);
    }

    return { userType };
  }

  async findAdmin(user_profile_id: string) {
    const admin = await this.adminRepository.findOne({
      where: {
        user_profile_id,
      },
      select: ['id', 'user_profile_id', 'type'],
    });

    if (!admin) {
      throw new NotFoundException([
        'Admin does not exist with this profile id',
      ]);
    }

    return { admin };
  }

  async findCustomerFromGenericUser(userId: string) {
    const findUserProfile = await this.userRepository
      .createQueryBuilder('u')
      .leftJoin('user_profiles', 'up', 'u.id=up.user_id')
      .leftJoin('customers', 'c', 'up.id=c.user_profile_id')
      .where('u.id=:userId', { userId })
      .getRawMany();

    return findUserProfile;
  }

  async findCustomer(user_profile_id: string) {
    const customer = await this.customerRepository.findOne({
      where: {
        user_profile_id,
      },
      select: ['id', 'user_profile_id'],
    });

    if (!customer) {
      throw new NotFoundException([
        'Customer doesnot exists with this profile id',
      ]);
    }

    return { customer };
  }
  async findUserBlockStatus(userId: string): Promise<boolean> {
    const findUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!findUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return findUser.block_status;
  }

  async searchUser(body: FilterUserDto) {
    const { search, status } = body;
    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.andWhere('user.name ILIKE :search OR user.email ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (status) {
      if (status.toLowerCase() === 'active') {
        query.andWhere('user.active_status = :active', { active: false });
      } else if (status.toLowerCase() === 'blocked') {
        query.andWhere('user.block_status = :blocked', { blocked: true });
      }
    }

    const users = await query.getMany();
    return users;
  }

  async getAllCustomers(body: PaginationDto): Promise<PaginatedUsersResponse> {
    const { offset, limit } = body;

    const query = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.userProfile', 'userProfile')
      .leftJoinAndSelect('userProfile.user', 'user')
      .select([
        'customer.id',
        'customer.loyaltyPoints',
        'customer.defaultAddressId',
        'customer.dateOfBirth',
        'customer.preferences',
        //profile col
        'userProfile.id',
        'userProfile.createdAt',

        //user
        'user.id',
        'user.name',
        'user.email',
        'user.phone',
        'user.profile',
        'user.active_status',
        'user.block_status',
      ])
      .skip((offset - 1) * limit)
      .take(limit);

    const [customers, total] = await query.getManyAndCount();

    return {
      data: customers,
      total,
      offset,
      limit,
    };
  }

//   async getAllCustomersbyfilter(
//     body: PaginationDto,
//     AccountStatus?: string | null,
//   ): Promise<PaginatedUsersResponse> {
//     const { offset, limit } = body;

//     let query = this.customerRepository
//       .createQueryBuilder('customer')
//       .leftJoinAndSelect('customer.userProfile', 'userProfile')
//       .leftJoinAndSelect('userProfile.user', 'user');


//     if (AccountStatus === 'Active') {
//       query = query.andWhere('user.active_status = :active', { active: true });
//       query = query.andWhere('user.block_status = :blocked', {
//         blocked: false,
//       });
//     } else if (AccountStatus === 'Blocked') {
//       query = query.andWhere('user.block_status = :blocked', { blocked: true });
//     }

//     query = query.skip((offset - 1) * limit).take(limit);

//     const [customers, total] = await query.getManyAndCount();

//     return {
//       data: customers,
//       total,
//       offset,
//       limit,
//     };
//   }

 
  async getAllUsers(offset: number, limit: number) {
    
    const data = await this.adminRepository
  .createQueryBuilder('admin')
  .leftJoin(UserProfileEntity, 'userProfile', 'userProfile.id = admin.user_profile_id')
  .leftJoin(UserEntity, 'user', 'user.id = userProfile.user_id')
  .select([
    'admin.id AS admin_id',
    'admin.type AS admin_type',
    'userProfile.id AS profile_id',
    'userProfile.user_type_id AS user_type_id',
    'user.id AS user_id',
    'user.name AS user_name',
    'user.email AS user_email',
    'user.phone AS user_phone',
  ])
  .getRawMany();
    
    const totalCount = await this.adminRepository.count();
    const hasMore = offset + limit < totalCount;
  
    return {
      total: totalCount,
      offset,
      limit,
      hasMore,
      data,
    };
  }
   
  
}
