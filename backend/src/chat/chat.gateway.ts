/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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

type AuthenticatedSocket = Socket & { data: { userId?: number } };

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, Set<string>> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    console.log('Secure private chat gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<{
        sub: number;
      }>(token, {
        secret: process.env.JWT_SECRET,
      });

      if (!payload?.sub) {
        client.disconnect();
        return;
      }

      client.data.userId = payload.sub;
      this.trackUserSocket(payload.sub, client.id);
      await this.chatService.setUserOnlineStatus(payload.sub, true);

      client.broadcast.emit('userOnline', { userId: payload.sub });
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (!userId) {
      return;
    }

    this.untrackUserSocket(userId, client.id);

    const stillConnected = this.userSockets.get(userId);
    if (!stillConnected || stillConnected.size === 0) {
      await this.chatService.setUserOnlineStatus(userId, false);
      client.broadcast.emit('userOffline', { userId });
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      return { ok: false, error: 'Unauthorized' };
    }

    if (!data?.conversationId) {
      return { ok: false, error: 'conversationId is required' };
    }

    await this.chatService.assertConversationMembership(
      data.conversationId,
      userId,
    );

    await client.join(this.getConversationRoom(data.conversationId));

    return {
      ok: true,
      conversationId: data.conversationId,
    };
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      return { ok: false, error: 'Unauthorized' };
    }

    if (!data?.conversationId) {
      return { ok: false, error: 'conversationId is required' };
    }

    await this.chatService.assertConversationMembership(
      data.conversationId,
      userId,
    );

    await client.leave(this.getConversationRoom(data.conversationId));
    return { ok: true, conversationId: data.conversationId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      conversationId: string;
      encryptedContent: string;
      iv: string;
      algorithm?: string;
      clientMessageId?: string;
    },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      return { ok: false, error: 'Unauthorized' };
    }

    const message = await this.chatService.sendMessage(userId, {
      conversationId: data.conversationId,
      encryptedContent: data.encryptedContent,
      iv: data.iv,
      algorithm: data.algorithm,
      clientMessageId: data.clientMessageId,
    });

    this.server
      .to(this.getConversationRoom(data.conversationId))
      .emit('receiveMessage', message);

    return { ok: true, message };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      return { ok: false, error: 'Unauthorized' };
    }

    await this.chatService.assertConversationMembership(
      data.conversationId,
      userId,
    );

    client.to(this.getConversationRoom(data.conversationId)).emit('typing', {
      conversationId: data.conversationId,
      userId,
      isTyping: data.isTyping,
      at: new Date().toISOString(),
    });

    return { ok: true };
  }

  emitOrderStatusUpdate(userId: number, orderData: unknown) {
    this.server.emit('orderStatusUpdate', {
      userId,
      orderData,
    });
  }

  emitOrderTrackingUpdate(userId: number, trackingData: unknown) {
    this.server.emit('orderTrackingUpdate', {
      userId,
      trackingData,
    });
  }

  private getConversationRoom(conversationId: string) {
    return `conversation:${conversationId}`;
  }

  private trackUserSocket(userId: number, socketId: string) {
    const sockets = this.userSockets.get(userId) || new Set<string>();
    sockets.add(socketId);
    this.userSockets.set(userId, sockets);
  }

  private untrackUserSocket(userId: number, socketId: string) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) {
      return;
    }

    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.userSockets.delete(userId);
    }
  }
}
