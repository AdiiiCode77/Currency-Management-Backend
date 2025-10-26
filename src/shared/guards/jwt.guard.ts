import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  GatewayTimeoutException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException(['Auth Header is missing']);
    }
    const token = authHeader.replace('Bearer', '').trim();
    if (!token) {
      throw new UnauthorizedException(['JWT token is missing']);
    }

    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    if (!decoded?.id) {
      throw new UnauthorizedException(['Invalid token payload']);
    }

    request.userId = decoded?.id;

    return true;
  }
}
