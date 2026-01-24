import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterAdminsDto {
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Type must be a string' })
  type?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Block status must be a boolean' })
  block_status?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
