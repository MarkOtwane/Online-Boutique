import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
