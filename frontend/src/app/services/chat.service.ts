import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api.config';
import {
  ChatConversation,
  ChatMessage,
  ChatUser,
  CreateMessageRequest,
} from '../interfaces/chat';
import { ChatCryptoService } from './chat-crypto.service';

interface IncomingEncryptedMessage {
  id: string;
  conversationId: string;
  senderId: number;
  encryptedContent: string;
  iv: string;
  algorithm: string;
  clientMessageId?: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    email: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = API_CONFIG.BASE_URL;
  private socket: Socket | null = null;
  private activeConversationId: string | null = null;

  private conversationsSubject = new BehaviorSubject<ChatConversation[]>([]);
  private activeConversationSubject =
    new BehaviorSubject<ChatConversation | null>(null);
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private onlineUsersSubject = new BehaviorSubject<ChatUser[]>([]);
  private typingUsersSubject = new BehaviorSubject<Set<number>>(new Set());

  conversations$ = this.conversationsSubject.asObservable();
  activeConversation$ = this.activeConversationSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();
  onlineUsers$ = this.onlineUsersSubject.asObservable();
  typingUsers$ = this.typingUsersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private chatCryptoService: ChatCryptoService,
  ) {}

  async initializeSocketConnection(): Promise<void> {
    await this.chatCryptoService.ensureIdentity();
    const publicKey = await this.chatCryptoService.getPublicKeyBundle();
    await firstValueFrom(this.upsertPublicKey(publicKey));

    if (this.socket) {
      this.socket.disconnect();
    }

    this.initializeSocket();
  }

  private initializeSocket(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    this.socket = io(this.apiUrl, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      if (this.activeConversationId) {
        this.joinConversation(this.activeConversationId);
      }
    });

    this.socket.on('receiveMessage', (message: IncomingEncryptedMessage) => {
      void this.handleIncomingEncryptedMessage(message);
    });

    this.socket.on('userOnline', (data: { userId: number }) => {
      this.handleUserOnline(data.userId);
    });

    this.socket.on('userOffline', (data: { userId: number }) => {
      this.handleUserOffline(data.userId);
    });

    this.socket.on(
      'typing',
      (data: { conversationId: string; userId: number; isTyping: boolean }) => {
        if (this.activeConversationId === data.conversationId) {
          this.handleUserTyping(data);
        }
      },
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getConversations(): Observable<ChatConversation[]> {
    return this.http.get<ChatConversation[]>(
      `${this.apiUrl}/chat/conversations`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  getConversationMessages(
    conversationId: string,
  ): Observable<IncomingEncryptedMessage[]> {
    return this.http.get<IncomingEncryptedMessage[]>(
      `${this.apiUrl}/chat/conversations/${conversationId}/messages`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  createConversation(
    userId: number,
    initiatorKeyBundle: string,
    recipientKeyBundle: string,
  ): Observable<ChatConversation> {
    return this.http.post<ChatConversation>(
      `${this.apiUrl}/chat/conversations`,
      {
        userId,
        initiatorKeyBundle,
        recipientKeyBundle,
      },
      {
        headers: this.getHeaders(),
      },
    );
  }

  getOnlineUsers(): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(`${this.apiUrl}/chat/users/online`, {
      headers: this.getHeaders(),
    });
  }

  markMessageAsRead(messageId: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/chat/messages/${messageId}/read`,
      {},
      {
        headers: this.getHeaders(),
      },
    );
  }

  setActiveConversation(conversation: ChatConversation | null): void {
    const previousId = this.activeConversationId;

    this.activeConversationSubject.next(conversation);
    this.activeConversationId = conversation?.id || null;

    if (previousId && previousId !== this.activeConversationId) {
      this.leaveConversation(previousId);
    }

    if (conversation) {
      this.joinConversation(conversation.id);
      void this.loadConversationMessages(conversation);
      return;
    }

    this.messagesSubject.next([]);
  }

  async loadConversationMessages(
    conversation: ChatConversation,
  ): Promise<void> {
    await this.chatCryptoService.setConversationKeyFromBundle(
      conversation.id,
      conversation.myKeyBundle,
    );

    this.getConversationMessages(conversation.id).subscribe({
      next: (messages) => {
        void this.decryptMessages(messages);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      },
    });
  }

  updateConversations(conversations: ChatConversation[]): void {
    this.conversationsSubject.next(conversations);
  }

  async sendEncryptedMessage(plainText: string): Promise<void> {
    if (!this.socket || !this.activeConversationId) {
      return;
    }

    const encrypted = await this.chatCryptoService.encryptMessage(
      this.activeConversationId,
      plainText,
    );

    const clientMessageId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const optimisticMessage: ChatMessage = {
      id: clientMessageId,
      conversationId: this.activeConversationId,
      senderId: -1,
      content: plainText,
      encryptedContent: encrypted.encryptedContent,
      iv: encrypted.iv,
      algorithm: encrypted.algorithm,
      clientMessageId,
      createdAt: new Date().toISOString(),
      isRead: false,
      sender: {
        id: -1,
        email: 'me',
        role: 'customer',
      },
    };

    this.messagesSubject.next([
      ...this.messagesSubject.getValue(),
      optimisticMessage,
    ]);

    const payload: CreateMessageRequest = {
      conversationId: this.activeConversationId,
      encryptedContent: encrypted.encryptedContent,
      iv: encrypted.iv,
      algorithm: encrypted.algorithm,
      clientMessageId,
    };

    this.socket.emit(
      'sendMessage',
      payload,
      (ack: {
        ok: boolean;
        message?: IncomingEncryptedMessage;
        error?: string;
      }) => {
        if (!ack?.ok || !ack.message) {
          this.messagesSubject.next(
            this.messagesSubject
              .getValue()
              .filter((msg) => msg.id !== clientMessageId),
          );
          return;
        }

        void this.replaceOptimisticMessage(
          clientMessageId,
          ack.message,
          plainText,
        );
      },
    );
  }

  sendTypingStatus(conversationId: string, isTyping: boolean): void {
    if (!this.socket) {
      return;
    }

    this.socket.emit('typing', { conversationId, isTyping });
  }

  joinConversation(conversationId: string): void {
    if (!this.socket) {
      return;
    }

    this.socket.emit('joinConversation', { conversationId });
  }

  leaveConversation(conversationId: string): void {
    if (!this.socket) {
      return;
    }

    this.socket.emit('leaveConversation', { conversationId });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isUserTyping(userId: number): boolean {
    return this.typingUsersSubject.getValue().has(userId);
  }

  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  }

  private upsertPublicKey(publicKey: string): Observable<unknown> {
    return this.http.post(
      `${this.apiUrl}/chat/keys/public`,
      { publicKey },
      {
        headers: this.getHeaders(),
      },
    );
  }

  private async handleIncomingEncryptedMessage(
    message: IncomingEncryptedMessage,
  ): Promise<void> {
    try {
      const content = await this.chatCryptoService.decryptMessage(
        message.conversationId,
        message.encryptedContent,
        message.iv,
      );

      const next: ChatMessage = {
        ...message,
        content,
      };

      if (this.activeConversationId === next.conversationId) {
        this.messagesSubject.next([...this.messagesSubject.getValue(), next]);
      }

      this.updateConversationLastMessage(next);
    } catch (error) {
      console.error('Unable to decrypt incoming chat message', error);
    }
  }

  private async decryptMessages(
    messages: IncomingEncryptedMessage[],
  ): Promise<void> {
    const decrypted = await Promise.all(
      messages.map(async (message) => {
        const content = await this.chatCryptoService.decryptMessage(
          message.conversationId,
          message.encryptedContent,
          message.iv,
        );

        return {
          ...message,
          content,
        };
      }),
    );

    this.messagesSubject.next(decrypted);
  }

  private async replaceOptimisticMessage(
    optimisticId: string,
    serverMessage: IncomingEncryptedMessage,
    fallbackPlainText: string,
  ): Promise<void> {
    const current = this.messagesSubject.getValue();

    let content = fallbackPlainText;
    try {
      content = await this.chatCryptoService.decryptMessage(
        serverMessage.conversationId,
        serverMessage.encryptedContent,
        serverMessage.iv,
      );
    } catch (_error) {
      content = fallbackPlainText;
    }

    const updated = current.map((message) =>
      message.id === optimisticId
        ? {
            ...serverMessage,
            content,
          }
        : message,
    );

    this.messagesSubject.next(updated);
    this.updateConversationLastMessage({ ...serverMessage, content });
  }

  private handleUserOnline(userId: number): void {
    const currentUsers = this.onlineUsersSubject.getValue();
    const userExists = currentUsers.find((user) => user.id === userId);

    if (userExists) {
      return;
    }

    this.http
      .get<ChatUser[]>(`${this.apiUrl}/chat/users/online`, {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (users) => {
          const updatedUser = users.find((user) => user.id === userId);
          if (updatedUser) {
            this.onlineUsersSubject.next([...currentUsers, updatedUser]);
          }
        },
      });
  }

  private handleUserOffline(userId: number): void {
    const currentUsers = this.onlineUsersSubject.getValue();
    this.onlineUsersSubject.next(
      currentUsers.filter((user) => user.id !== userId),
    );
  }

  private handleUserTyping(data: { userId: number; isTyping: boolean }): void {
    const current = this.typingUsersSubject.getValue();
    const next = new Set(current);

    if (data.isTyping) {
      next.add(data.userId);
    } else {
      next.delete(data.userId);
    }

    this.typingUsersSubject.next(next);
  }

  private updateConversationLastMessage(message: ChatMessage): void {
    const updated = this.conversationsSubject
      .getValue()
      .map((conversation) =>
        conversation.id === message.conversationId
          ? {
              ...conversation,
              lastMessage: message,
              updatedAt: message.createdAt,
            }
          : conversation,
      );

    this.conversationsSubject.next(updated);
  }
}
