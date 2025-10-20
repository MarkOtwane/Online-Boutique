/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  productId: number;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}

export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  content: string;
}

export class MarkAsAdminResponseDto {
  @IsInt()
  commentId: number;

  @IsOptional()
  isOfficialResponse?: boolean;
}
