import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ChatConversation,
  ChatMessage,
  ChatUser,
  CreateMessageRequest,
} from '../interfaces/chat';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  conversations: ChatConversation[] = [];
  activeConversation: ChatConversation | null = null;
  messages: ChatMessage[] = [];
  onlineUsers: ChatUser[] = [];
  currentUser: User | null = null;
  newMessage = '';
  loading = false;
  selectedUser: ChatUser | null = null;
  showNewChatModal = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.currentUser = user;
      if (user && (user.role === 'customer' || user.role === 'admin')) {
        // Initialize socket connection when user is authenticated
        this.chatService.initializeSocketConnection();
        this.loadConversations();
        this.loadOnlineUsers();
      }
    });

    // Subscribe to chat service observables
    this.chatService.conversations$.subscribe((conversations) => {
      this.conversations = conversations;
    });

    this.chatService.activeConversation$.subscribe((conversation) => {
      this.activeConversation = conversation;
    });

    this.chatService.messages$.subscribe((messages) => {
      this.messages = messages;
    });

    this.chatService.onlineUsers$.subscribe((users) => {
      this.onlineUsers = users;
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadConversations(): void {
    this.loading = true;
    this.chatService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.loading = false;
      },
    });
  }

  loadOnlineUsers(): void {
    this.chatService.getOnlineUsers().subscribe({
      next: (users) => {
        this.onlineUsers = users.filter(
          (user) => user.id !== this.currentUser?.id
        );
      },
      error: (error) => {
        console.error('Error loading online users:', error);
      },
    });
  }

  selectConversation(conversation: ChatConversation): void {
    this.chatService.setActiveConversation(conversation);
  }

  openNewChatModal(): void {
    this.showNewChatModal = true;
    this.selectedUser = null;
  }

  closeNewChatModal(): void {
    this.showNewChatModal = false;
    this.selectedUser = null;
  }

  selectUser(user: ChatUser): void {
    this.selectedUser = user;
  }

  startConversation(): void {
    if (!this.selectedUser) return;

    this.chatService.createConversation(this.selectedUser.id).subscribe({
      next: (conversation) => {
        this.conversations.unshift(conversation);
        this.chatService.setActiveConversation(conversation);
        this.closeNewChatModal();
      },
      error: (error) => {
        console.error('Error creating conversation:', error);
      },
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.activeConversation) return;

    const receiverId = this.getReceiverId();
    if (!receiverId) return;

    const messageData: CreateMessageRequest = {
      receiverId,
      content: this.newMessage.trim(),
    };

    this.chatService.sendMessage(messageData).subscribe({
      next: (message) => {
        this.chatService.addMessage(message);
        this.newMessage = '';
      },
      error: (error) => {
        console.error('Error sending message:', error);
      },
    });
  }

  getReceiverId(): number | null {
    if (!this.activeConversation || !this.currentUser) return null;

    const receiver = this.activeConversation.participants.find(
      (participant) => participant.id !== this.currentUser!.id
    );
    return receiver ? receiver.id : null;
  }

  getReceiverInfo(): ChatUser | null {
    if (!this.activeConversation || !this.currentUser) return null;

    return (
      this.activeConversation.participants.find(
        (participant) => participant.id !== this.currentUser!.id
      ) || null
    );
  }

  getConversationReceiverInfo(conversation: ChatConversation): ChatUser | null {
    if (!conversation || !this.currentUser) return null;

    return (
      conversation.participants.find(
        (participant) => participant.id !== this.currentUser!.id
      ) || null
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }

  isCurrentUserMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUser?.id;
  }

  getUnreadCount(conversation: ChatConversation): number {
    return conversation.unreadCount;
  }

  markMessagesAsRead(): void {
    if (!this.activeConversation) return;

    this.messages.forEach((message) => {
      if (!message.isRead && message.receiverId === this.currentUser?.id) {
        this.chatService.markMessageAsRead(message.id).subscribe({
          error: (error) =>
            console.error('Error marking message as read:', error),
        });
      }
    });
  }

  canAccessChat(): boolean {
    return (
      this.currentUser?.role === 'customer' ||
      this.currentUser?.role === 'admin'
    );
  }
}
