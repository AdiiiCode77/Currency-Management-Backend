import { IsString } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  previous_password: string;

  @IsString()
  new_password: string;
}
