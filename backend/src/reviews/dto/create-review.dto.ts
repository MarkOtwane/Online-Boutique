import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsString()
  content: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reviewImages?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  verifiedPurchase?: boolean;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reviewImages?: string[];
}

export class MarkHelpfulDto {
  @IsBoolean()
  @Type(() => Boolean)
  isHelpful: boolean;
}

export class ReviewQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  productId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  ratingFilter?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  onlyVerified?: boolean;
}
