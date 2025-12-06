import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateEmployeeAccountDto {
  @ApiProperty({ example: 'Ali Ahmed' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Muhammad Ahmed' })
  @IsString()
  @IsNotEmpty()
  fatherName: string;

  @ApiProperty({ example: '35202-1234567-8' })
  @IsString()
  @IsNotEmpty()
  cnic: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiProperty({ example: '123 Main Street, Lahore' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 50000.00 })
  @IsNumber()
  @IsNotEmpty()
  monthlySalary: number;

  @ApiProperty({ example: '2024-10-01' })
  @IsDateString()
  @IsNotEmpty()
  joiningDate: string;
}
