// src/auth/guards/is-admin.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../../modules/users/application/user.service';
import { Request } from 'express';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(private readonly usersService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;

    const userId = request.userId;
    if (!userId) throw new ForbiddenException(['No user found in request']);

    const { user } = await this.usersService.findUserById(userId);
    if (!user) throw new ForbiddenException(['User not found']);

    const { userType } = await this.usersService.findUserTypeByName('admin');
    if (!userType) throw new ForbiddenException(['Invalid user type']);

    const { userProfile } = await this.usersService.findUserProfile(
      user.id,
      userType.id,
      'admin',
    );
    if (!userProfile) throw new ForbiddenException(['Admin profile not found']);

    const { admin } = await this.usersService.findAdmin(userProfile.id);
    if (!admin) {
      throw new NotFoundException([
        'No such admin exists with this profile id',
      ]);
    }

    request.adminId = admin.id;

    return true;
  }
}
