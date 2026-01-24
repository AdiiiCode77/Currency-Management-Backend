import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperAdminEntity } from '../../modules/super-admin/domain/entities/super-admin.entity';

@Injectable()
export class IsSuperAdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(SuperAdminEntity)
    private superAdminRepository: Repository<SuperAdminEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if user has super-admin role
    if (user.role !== 'super-admin') {
      throw new UnauthorizedException(
        'Access denied. Super admin privileges required.',
      );
    }

    // Verify super admin exists and is active
    const superAdmin = await this.superAdminRepository.findOne({
      where: { id: user.id },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Super admin not found');
    }

    if (!superAdmin.is_active) {
      throw new UnauthorizedException('Super admin account is inactive');
    }

    return true;
  }
}
