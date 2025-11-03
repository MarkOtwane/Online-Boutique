import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto, CreateMessageDto } from './chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: number) {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return conversations.map((conversation) => {
      const { messages, participants, ...conversationData } = conversation;
      const otherParticipants = participants
        .filter((p) => p.userId !== userId)
        .map((p) => p.user);

      const lastMessage = messages[0] || null;
      const unreadCount = this.getUnreadCount(conversation.id, userId);

      return {
        ...conversationData,
        participants: otherParticipants,
        lastMessage,
        unreadCount,
      };
    });
  }

  async getConversationMessages(conversationId: number, userId: number) {
    // Verify user is part of the conversation
    const conversation = await this.prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
          },
        },
      },
    });

    if (!conversation) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return this.prisma.chatMessage.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createConversation(userId: number, dto: CreateConversationDto) {
    // Check if conversation already exists between these users
    const existingConversation = await this.prisma.chatConversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [userId, dto.userId],
            },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      const otherParticipants = existingConversation.participants
        .filter((p) => p.userId !== userId)
        .map((p) => p.user);

      return {
        ...existingConversation,
        participants: otherParticipants,
        unreadCount: 0,
      };
    }

    // Create new conversation
    const conversation = await this.prisma.chatConversation.create({
      data: {},
      include: {
        participants: true,
      },
    });

    // Add participants
    await this.prisma.chatConversationParticipant.createMany({
      data: [
        {
          conversationId: conversation.id,
          userId,
        },
        {
          conversationId: conversation.id,
          userId: dto.userId,
        },
      ],
    });

    // Fetch complete conversation data
    return this.prisma.chatConversation.findUnique({
      where: { id: conversation.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });
  }

  async sendMessage(userId: number, dto: CreateMessageDto) {
    // Find or create conversation between users
    let conversation = await this.prisma.chatConversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [userId, dto.receiverId],
            },
          },
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.chatConversation.create({
        data: {},
      });

      // Add participants
      await this.prisma.chatConversationParticipant.createMany({
        data: [
          {
            conversationId: conversation.id,
            userId,
          },
          {
            conversationId: conversation.id,
            userId: dto.receiverId,
          },
        ],
      });
    }

    // Create the message
    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        receiverId: dto.receiverId,
        content: dto.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Update conversation's updatedAt timestamp
    await this.prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getOnlineUsers(userId: number) {
    return this.prisma.user.findMany({
      where: {
        id: {
          not: userId,
        },
        isOnline: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isOnline: true,
        lastSeen: true,
      },
    });
  }

  async getOrCreateGlobalGroupChat(userId: number) {
    // Check if a global group chat already exists
    let groupChat = await this.prisma.chatConversation.findFirst({
      where: {
        isGlobalGroup: true,
      },
    });

    // If no global group chat exists, create one
    if (!groupChat) {
      groupChat = await this.prisma.chatConversation.create({
        data: {
          isGlobalGroup: true,
        },
      });
    }

    // Check if user is already a participant
    const isParticipant =
      await this.prisma.chatConversationParticipant.findFirst({
        where: {
          conversationId: groupChat.id,
          userId,
        },
      });

    // If user is not a participant, add them
    if (!isParticipant) {
      await this.prisma.chatConversationParticipant.create({
        data: {
          conversationId: groupChat.id,
          userId,
        },
      });
    }

    // Get fresh data with participants and user info
    const freshGroupChat = await this.prisma.chatConversation.findUnique({
      where: { id: groupChat.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    if (!freshGroupChat) {
      throw new Error('Failed to create or find global group chat');
    }

    return {
      ...freshGroupChat,
      participants: freshGroupChat.participants.map((p) => p.user),
      unreadCount: 0,
    };
  }

  async markMessageAsRead(userId: number, messageId: number) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException(
        'You can only mark your own messages as read',
      );
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async setUserOnlineStatus(userId: number, isOnline: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: new Date(),
      },
    });
  }

  private async getUnreadCount(
    conversationId: number,
    userId: number,
  ): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
    });
  }
}
