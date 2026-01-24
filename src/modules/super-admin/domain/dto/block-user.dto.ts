import { IsBoolean, IsNotEmpty } from 'class-validator';

export class BlockUserDto {
  @IsNotEmpty({ message: 'Block status is required' })
  @IsBoolean({ message: 'Block status must be a boolean' })
  block_status: boolean;
}
