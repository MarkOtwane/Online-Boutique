import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, ChatConversation, CreateMessageRequest, ChatUser } from '../interfaces/chat';
import { API_CONFIG } from '../config/api.config';

@Injectable({
   providedIn: 'root',
 })
export class ChatService {
   private apiUrl = API_CONFIG.BASE_URL;
   private socket: Socket | null = null;
   private conversationsSubject = new BehaviorSubject<ChatConversation[]>([]);
   private activeConversationSubject = new BehaviorSubject<ChatConversation | null>(null);
   private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
   private onlineUsersSubject = new BehaviorSubject<ChatUser[]>([]);
   private typingUsersSubject = new BehaviorSubject<Set<number>>(new Set());

   conversations$ = this.conversationsSubject.asObservable();
   activeConversation$ = this.activeConversationSubject.asObservable();
   messages$ = this.messagesSubject.asObservable();
   onlineUsers$ = this.onlineUsersSubject.asObservable();
   typingUsers$ = this.typingUsersSubject.asObservable();

   constructor(private http: HttpClient) {
     // Don't initialize socket immediately - wait for authentication
   }

   public initializeSocketConnection(): void {
     if (this.socket) {
       this.socket.disconnect();
     }
     this.initializeSocket();
   }

   private initializeSocket(): void {
     const token = localStorage.getItem('access_token');
     if (!token) {
       console.warn('No access token found for socket connection');
       return;
     }
     
     this.socket = io(this.apiUrl, {
       auth: {
         token,
       },
     });

     this.socket.on('connect', () => {
       console.log('Connected to chat server');
     });

     this.socket.on('disconnect', () => {
       console.log('Disconnected from chat server');
     });

     this.socket.on('newMessage', (message: ChatMessage) => {
       this.handleNewMessage(message);
     });

     this.socket.on('userOnline', (data: { userId: number }) => {
       this.handleUserOnline(data.userId);
     });

     this.socket.on('userOffline', (data: { userId: number }) => {
       this.handleUserOffline(data.userId);
     });

     this.socket.on('userTyping', (data: { userId: number; isTyping: boolean }) => {
       this.handleUserTyping(data);
     });

     this.socket.on('messageRead', (data: { messageId: number }) => {
       this.handleMessageRead(data.messageId);
     });

     this.socket.on('newConversation', (data: any) => {
       this.handleNewConversation(data);
     });
   }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getConversations(): Observable<ChatConversation[]> {
    return this.http.get<ChatConversation[]>(`${this.apiUrl}/chat/conversations`, {
      headers: this.getHeaders(),
    });
  }

  getConversationMessages(conversationId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/chat/conversations/${conversationId}/messages`, {
      headers: this.getHeaders(),
    });
  }

  createConversation(userId: number): Observable<ChatConversation> {
    return this.http.post<ChatConversation>(`${this.apiUrl}/chat/conversations`, { userId }, {
      headers: this.getHeaders(),
    });
  }

  sendMessage(messageData: CreateMessageRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/chat/messages`, messageData, {
      headers: this.getHeaders(),
    });
  }

  getOnlineUsers(): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(`${this.apiUrl}/chat/users/online`, {
      headers: this.getHeaders(),
    });
  }

  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/chat/messages/${messageId}/read`, {}, {
      headers: this.getHeaders(),
    });
  }

  // Local state management methods
  setActiveConversation(conversation: ChatConversation | null): void {
    this.activeConversationSubject.next(conversation);
    if (conversation) {
      this.loadConversationMessages(conversation.id);
    }
  }

  addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...currentMessages, message]);
  }

  updateConversations(conversations: ChatConversation[]): void {
    this.conversationsSubject.next(conversations);
  }

  loadConversationMessages(conversationId: number): void {
    this.getConversationMessages(conversationId).subscribe({
      next: (messages) => this.messagesSubject.next(messages),
      error: (error) => console.error('Error loading messages:', error),
    });
  }

  getActiveConversation(): ChatConversation | null {
    return this.activeConversationSubject.getValue();
  }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.getValue();
  }

  // Real-time event handlers
  private handleNewMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.getValue();
    const activeConversation = this.activeConversationSubject.getValue();

    // Only add message if it belongs to the active conversation
    if (activeConversation && message.conversationId === activeConversation.id) {
      this.messagesSubject.next([...currentMessages, message]);
    }

    // Update conversation's last message
    this.updateConversationLastMessage(message);
  }

  private handleUserOnline(userId: number): void {
    const currentUsers = this.onlineUsersSubject.getValue();
    const userExists = currentUsers.find(user => user.id === userId);

    if (!userExists) {
      // Fetch user details and add to online users
      this.http.get<ChatUser[]>(`${this.apiUrl}/chat/users/online`).subscribe({
        next: (users) => {
          const updatedUser = users.find(user => user.id === userId);
          if (updatedUser) {
            this.onlineUsersSubject.next([...currentUsers, updatedUser]);
          }
        },
      });
    }
  }

  private handleUserOffline(userId: number): void {
    const currentUsers = this.onlineUsersSubject.getValue();
    const filteredUsers = currentUsers.filter(user => user.id !== userId);
    this.onlineUsersSubject.next(filteredUsers);
  }

  private handleUserTyping(data: { userId: number; isTyping: boolean }): void {
    const currentTypingUsers = this.typingUsersSubject.getValue();
    const newTypingUsers = new Set(currentTypingUsers);

    if (data.isTyping) {
      newTypingUsers.add(data.userId);
    } else {
      newTypingUsers.delete(data.userId);
    }

    this.typingUsersSubject.next(newTypingUsers);
  }

  private handleMessageRead(messageId: number): void {
    const currentMessages = this.messagesSubject.getValue();
    const updatedMessages = currentMessages.map(msg =>
      msg.id === messageId ? { ...msg, isRead: true } : msg
    );
    this.messagesSubject.next(updatedMessages);
  }

  private handleNewConversation(data: any): void {
    // Refresh conversations list when a new conversation is created
    this.getConversations().subscribe({
      next: (conversations) => {
        this.conversationsSubject.next(conversations);
      },
    });
  }

  private updateConversationLastMessage(message: ChatMessage): void {
    const currentConversations = this.conversationsSubject.getValue();
    const updatedConversations = currentConversations.map(conv =>
      conv.id === message.conversationId
        ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
        : conv
    );
    this.conversationsSubject.next(updatedConversations);
  }

  // Socket.IO methods for real-time functionality
  joinConversation(conversationId: number): void {
    if (this.socket) {
      this.socket.emit('joinChat', { conversationId });
    }
  }

  leaveConversation(conversationId: number): void {
    if (this.socket) {
      this.socket.emit('leaveChat', { conversationId });
    }
  }

  sendMessageRealTime(conversationId: number, content: string, receiverId: number): void {
    if (this.socket) {
      this.socket.emit('sendMessage', { conversationId, content, receiverId });
    }
  }

  sendTypingStatus(conversationId: number, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isUserTyping(userId: number): boolean {
    return this.typingUsersSubject.getValue().has(userId);
  }

  // Global Group Chat Methods
  getGlobalGroupChat(): Observable<ChatConversation> {
    return this.http.get<ChatConversation>(`${this.apiUrl}/chat/global-group`, {
      headers: this.getHeaders(),
    });
  }

  joinGlobalGroupChat(conversationId: number): void {
    this.joinConversation(conversationId);
  }

  leaveGlobalGroupChat(conversationId: number): void {
    this.leaveConversation(conversationId);
  }

  sendGlobalGroupMessage(conversationId: number, content: string): void {
    if (this.socket) {
      this.socket.emit('sendMessage', { conversationId, content, receiverId: null });
    }
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
}
