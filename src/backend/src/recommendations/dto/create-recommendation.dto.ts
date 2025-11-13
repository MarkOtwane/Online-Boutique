import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum RecommendationType {
  COLLABORATIVE = 'collaborative',
  CONTENT_BASED = 'content_based',
  TRENDING = 'trending',
  PERSONALIZED = 'personalized',
}

export class CreateRecommendationDto {
  @IsInt()
  @Type(() => Number)
  userId: number;

  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsEnum(RecommendationType)
  recommendationType: RecommendationType;

  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  score: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateRecommendationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  score?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isViewed?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isClicked?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPurchased?: boolean;
}

export class TrackBehaviorDto {
  @IsInt()
  @Type(() => Number)
  userId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  productId?: number;

  @IsString()
  actionType: 'view' | 'cart_add' | 'purchase' | 'review' | 'search';

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class GetRecommendationsQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsArray()
  @IsEnum(RecommendationType, { each: true })
  recommendationTypes?: RecommendationType[];

  @IsOptional()
  @IsString()
  sortBy?: 'score' | 'createdAt' = 'score';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
