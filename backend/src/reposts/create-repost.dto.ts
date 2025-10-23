import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRepostDto {
  @IsNumber()
  productId: number;

  @IsOptional()
  @IsString()
  content?: string;
}
