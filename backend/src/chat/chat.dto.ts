import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @IsInt()
  receiverId?: number;

  @IsOptional()
  @IsInt()
  conversationId?: number;

  @IsString()
  @MinLength(1)
  content: string;
}

export class CreateConversationDto {
  @IsInt()
  userId: number;
}

export class MarkMessageReadDto {
  @IsInt()
  messageId: number;
}
