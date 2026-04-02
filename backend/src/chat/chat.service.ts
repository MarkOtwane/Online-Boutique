/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateConversationDto,
  CreateMessageDto,
  UpsertChatPublicKeyDto,
} from './chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: number) {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: {
        participant1: {
          select: {
            id: true,
            email: true,
            role: true,
            isOnline: true,
            lastSeen: true,
            chatPublicKey: true,
          },
        },
        participant2: {
          select: {
            id: true,
            email: true,
            role: true,
            isOnline: true,
            lastSeen: true,
            chatPublicKey: true,
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

    return Promise.all(
      conversations.map(async (conversation) => {
        const participants = [
          conversation.participant1,
          conversation.participant2,
        ].filter((participant) => participant.id !== userId);

        const myKeyBundle =
          conversation.participant1Id === userId
            ? conversation.participant1KeyBundle
            : conversation.participant2KeyBundle;

        return {
          id: conversation.id,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          participant1Id: conversation.participant1Id,
          participant2Id: conversation.participant2Id,
          participants,
          myKeyBundle,
          lastMessage: conversation.messages[0] || null,
          unreadCount: await this.getUnreadCount(conversation.id, userId),
        };
      }),
    );
  }

  async getConversationMessages(conversationId: string, userId: number) {
    await this.assertConversationMembership(conversationId, userId);

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
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createConversation(userId: number, dto: CreateConversationDto) {
    if (userId === dto.userId) {
      throw new ForbiddenException(
        'You cannot create a conversation with yourself',
      );
    }

    const recipient = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    const pair = this.getOrderedPair(userId, dto.userId);

    const existing = await this.prisma.chatConversation.findUnique({
      where: {
        participant1Id_participant2Id: {
          participant1Id: pair.participant1Id,
          participant2Id: pair.participant2Id,
        },
      },
      include: {
        participant1: {
          select: {
            id: true,
            email: true,
            role: true,
            isOnline: true,
            lastSeen: true,
            chatPublicKey: true,
          },
        },
        participant2: {
          select: {
            id: true,
            email: true,
            role: true,
            isOnline: true,
            lastSeen: true,
            chatPublicKey: true,
          },
        },
      },
    });

    if (existing) {
      return this.formatConversationForUser(existing, userId);
    }

    const conversation = await this.prisma.chatConversation.create({
      data: {
        participant1Id: pair.participant1Id,
        participant2Id: pair.participant2Id,
        participant1KeyBundle:
          pair.participant1Id === userId
            ? dto.initiatorKeyBundle
            : dto.recipientKeyBundle,
        participant2KeyBundle:
          pair.participant2Id === userId
            ? dto.initiatorKeyBundle
            : dto.recipientKeyBundle,
      },
      include: {
        participant1: {
          select: {
            id: true,
            email: true,
            role: true,
            isOnline: true,
            lastSeen: true,
            chatPublicKey: true,
          },
        },
        participant2: {
          select: {
            id: true,
            email: true,
            role: true,
            isOnline: true,
            lastSeen: true,
            chatPublicKey: true,
          },
        },
      },
    });

    return this.formatConversationForUser(conversation, userId);
  }

  async sendMessage(userId: number, dto: CreateMessageDto) {
    const conversation = await this.assertConversationMembership(
      dto.conversationId,
      userId,
    );

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        encryptedContent: dto.encryptedContent,
        iv: dto.iv,
        algorithm: dto.algorithm || 'AES-GCM',
        clientMessageId: dto.clientMessageId,
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
    });

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
        chatPublicKey: true,
      },
    });
  }

  async markMessageAsRead(userId: number, messageId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        conversation: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const isParticipant =
      message.conversation.participant1Id === userId ||
      message.conversation.participant2Id === userId;

    if (!isParticipant) {
      throw new ForbiddenException(
        'You can only mark messages in your conversations',
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

  async upsertChatPublicKey(userId: number, dto: UpsertChatPublicKeyDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        chatPublicKey: dto.publicKey,
      },
      select: {
        id: true,
        email: true,
        chatPublicKey: true,
      },
    });
  }

  async assertConversationMembership(conversationId: string, userId: number) {
    const conversation = await this.prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
    });

    if (!conversation) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return conversation;
  }

  private formatConversationForUser(
    conversation: {
      id: string;
      participant1Id: number;
      participant2Id: number;
      participant1KeyBundle: string;
      participant2KeyBundle: string;
      participant1: {
        id: number;
        email: string;
        role: string;
        isOnline: boolean;
        lastSeen: Date;
        chatPublicKey: string | null;
      };
      participant2: {
        id: number;
        email: string;
        role: string;
        isOnline: boolean;
        lastSeen: Date;
        chatPublicKey: string | null;
      };
      createdAt: Date;
      updatedAt: Date;
    },
    userId: number,
  ) {
    return {
      id: conversation.id,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      participants: [
        conversation.participant1,
        conversation.participant2,
      ].filter((participant) => participant.id !== userId),
      myKeyBundle:
        conversation.participant1Id === userId
          ? conversation.participant1KeyBundle
          : conversation.participant2KeyBundle,
      unreadCount: 0,
    };
  }

  private getOrderedPair(userA: number, userB: number) {
    if (userA < userB) {
      return { participant1Id: userA, participant2Id: userB };
    }

    return { participant1Id: userB, participant2Id: userA };
  }

  private async getUnreadCount(
    conversationId: string,
    userId: number,
  ): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        isRead: false,
      },
    });
  }
}
