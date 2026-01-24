import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @IsOptional()
  @IsBoolean({ message: 'Block status must be a boolean' })
  block_status?: boolean;

  @IsOptional()
  @IsString({ message: 'Type must be a string' })
  type?: string;
}
