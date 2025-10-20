import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  receiverId: number;

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