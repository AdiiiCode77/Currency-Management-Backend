import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerAccountDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the customer',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '+923001234567',
    description: 'Customer contact number',
  })
  @IsString()
  contact: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Customer email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123 Street, Lahore',
    description: 'Customer full address',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'ACC-987654',
    description: 'Old account number (reference)',
  })
  @IsString()
  oldAccountNumber: string;
}
