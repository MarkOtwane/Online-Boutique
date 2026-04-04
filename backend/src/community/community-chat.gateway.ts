import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommunityService } from './community.service';

type CommunitySocket = Socket & { data: { userId?: number } };

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
})
export class CommunityChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly communityService: CommunityService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: CommunitySocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<{ sub: number }>(
        token,
        {
          secret: process.env.JWT_SECRET,
        },
      );

      if (!payload?.sub) {
        client.disconnect();
        return;
      }

      client.data.userId = payload.sub;
      await client.join('community-hub');
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: CommunitySocket) {
    if (!client.data.userId) {
      return;
    }
  }

  @SubscribeMessage('sendCommunityMessage')
  async handleSendCommunityMessage(
    @ConnectedSocket() client: CommunitySocket,
    @MessageBody() data: { message: string },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      return { ok: false, error: 'Unauthorized' };
    }

    const message = await this.communityService.createCommunityChatMessage(
      userId,
      {
        message: data.message,
      },
    );

    this.server.to('community-hub').emit('receiveCommunityMessage', message);

    return { ok: true, message };
  }
}
