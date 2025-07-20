/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateCustomerDto {
  /*
   * register, name, email password
   *
   */
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
