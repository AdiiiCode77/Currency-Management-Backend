import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateEmployeeAccountDto {
  @ApiProperty({ example: 'Ali Ahmed' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Muhammad Ahmed' })
  @IsOptional()
  fatherName: string;

  @ApiProperty({ example: '35202-1234567-8' })
  @IsOptional()
  cnic: string;

  @ApiProperty({ example: '+923001234567' })
  @IsOptional()
  contact: string;

  @ApiProperty({ example: '123 Main Street, Lahore' })
  @IsOptional()
  address: string;

  @ApiProperty({ example: 50000.00 })
  @IsOptional()
  monthlySalary: number;

  @ApiProperty({ example: '2024-10-01' })
  @IsOptional()
  joiningDate: string;
}
