import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, number> = new Map();

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('Chat Gateway initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // Here you would verify the JWT token and get user info
      // For now, we'll use a simple approach
      const userId = client.handshake.auth?.userId;
      if (userId) {
        this.connectedUsers.set(client.id, userId);
        await this.chatService.setUserOnlineStatus(userId, true);

        // Notify other users that this user is online
        client.broadcast.emit('userOnline', { userId });
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
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: number }) {
    client.join(`conversation_${data.conversationId}`);
    return { event: 'joinedChat', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: number }) {
    client.leave(`conversation_${data.conversationId}`);
    return { event: 'leftChat', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; content: string; receiverId: number }
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        return { error: 'User not authenticated' };
      }

      // Save message to database
      const message = await this.chatService.sendMessage(userId, {
        receiverId: data.receiverId,
        content: data.content,
      });

      // Emit to conversation room
      this.server.to(`conversation_${data.conversationId}`).emit('newMessage', message);

      return { event: 'messageSent', data: message };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; isTyping: boolean }
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
    this.server.to(`conversation_${conversationId}`).emit('messageRead', { messageId });
  }

  // Method to emit real-time updates when new conversations are created
  async emitNewConversation(conversation: any, userId: number) {
    // Notify the other participant about the new conversation
    const otherParticipants = conversation.participants.filter((p: any) => p.userId !== userId);
    otherParticipants.forEach((participant: any) => {
      this.server.emit('newConversation', {
        conversation,
        forUser: participant.userId,
      });
    });
  }
}