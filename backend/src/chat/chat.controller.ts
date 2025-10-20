/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateConversationDto, CreateMessageDto } from './chat.dto';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.id);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async getConversationMessages(
    @Request() req,
    @Param('id', ParseIntPipe) conversationId: number,
  ) {
    return this.chatService.getConversationMessages(
      conversationId,
      req.user.id,
    );
  }

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  async createConversation(@Request() req, @Body() dto: CreateConversationDto) {
    const conversation = await this.chatService.createConversation(
      req.user.id,
      dto,
    );

    if (!conversation) {
      return null;
    }

    // Format the response to match frontend expectations
    const participants = conversation.participants || [];
    const otherParticipants = participants
      .filter((p: any) => p.userId !== req.user.id)
      .map((p: any) => p.user);

    return {
      ...conversation,
      participants: otherParticipants,
      unreadCount: 0,
    };
  }

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  async sendMessage(@Request() req, @Body() dto: CreateMessageDto) {
    return this.chatService.sendMessage(req.user.id, dto);
  }

  @Get('users/online')
  @UseGuards(JwtAuthGuard)
  async getOnlineUsers(@Request() req) {
    return this.chatService.getOnlineUsers(req.user.id);
  }

  @Put('messages/:id/read')
  @UseGuards(JwtAuthGuard)
  async markMessageAsRead(
    @Request() req,
    @Param('id', ParseIntPipe) messageId: number,
  ) {
    return this.chatService.markMessageAsRead(req.user.id, messageId);
  }

  @Post('status/online')
  @UseGuards(JwtAuthGuard)
  async setOnlineStatus(@Request() req, @Body() body: { isOnline: boolean }) {
    return this.chatService.setUserOnlineStatus(req.user.id, body.isOnline);
  }
}
