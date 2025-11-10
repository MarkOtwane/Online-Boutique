/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, number> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    console.log('Chat Gateway initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      // Extract token from handshake auth
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        console.log('No token provided, disconnecting client');
        client.disconnect();
        return;
      }

      // Verify JWT token and extract user info
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        const userId = payload.sub;

        if (userId) {
          this.connectedUsers.set(client.id, userId);
          await this.chatService.setUserOnlineStatus(userId, true);

          // Notify other users that this user is online
          client.broadcast.emit('userOnline', { userId });
          console.log(`User ${userId} connected via WebSocket`);
        } else {
          console.log('No userId in token payload, disconnecting');
          client.disconnect();
        }
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        client.disconnect();
      }
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      await this.chatService.setUserOnlineStatus(userId, false);

      // Notify other users that this user is offline
      client.broadcast.emit('userOffline', { userId });
    }
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    client.join(`conversation_${data.conversationId}`);
    return {
      event: 'joinedChat',
      data: { conversationId: data.conversationId },
    };
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    client.leave(`conversation_${data.conversationId}`);
    return { event: 'leftChat', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: number;
      content: string;
      receiverId?: number | null;
    },
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        return { error: 'User not authenticated' };
      }

      // Save message to database
      const message = await this.chatService.sendMessage(userId, {
        conversationId: data.conversationId,
        receiverId: data.receiverId || null, // Allow null for group messages
        content: data.content,
      });

      // Emit to conversation room
      this.server
        .to(`conversation_${data.conversationId}`)
        .emit('newMessage', message);

      return { event: 'messageSent', data: message };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; isTyping: boolean },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      client.to(`conversation_${data.conversationId}`).emit('userTyping', {
        userId,
        isTyping: data.isTyping,
      });
    }
  }

  // Method to emit real-time updates when messages are read
  async emitMessageRead(messageId: number, conversationId: number) {
    this.server
      .to(`conversation_${conversationId}`)
      .emit('messageRead', { messageId });
  }

  // Method to emit real-time updates when new conversations are created
  async emitNewConversation(conversation: any, userId: number) {
    // Notify the other participant about the new conversation
    const otherParticipants = conversation.participants.filter(
      (p: any) => p.userId !== userId,
    );
    otherParticipants.forEach((participant: any) => {
      this.server.emit('newConversation', {
        conversation,
        forUser: participant.userId,
      });
    });
  }
}
