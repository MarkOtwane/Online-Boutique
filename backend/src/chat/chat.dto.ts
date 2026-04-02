import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  @MinLength(1)
  encryptedContent: string;

  @IsString()
  @MinLength(1)
  iv: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  algorithm?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  clientMessageId?: string;
}

export class CreateConversationDto {
  @IsInt()
  userId: number;

  @IsString()
  @MinLength(1)
  initiatorKeyBundle: string;

  @IsString()
  @MinLength(1)
  recipientKeyBundle: string;
}

export class MarkMessageReadDto {
  @IsUUID()
  messageId: string;
}

export class UpsertChatPublicKeyDto {
  @IsString()
  @MinLength(1)
  publicKey: string;
}
