import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatConversation, ChatMessage } from '../interfaces/chat';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.css'],
})
export class GroupChatComponent implements OnInit, OnDestroy {
  globalGroupChat: ChatConversation | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  currentUser: User | null = null;
  isConnected = false;
  loading = false;
  onlineUsers: any[] = [];
  showOnlineUsers = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.currentUser = user;
      if (user && !this.isConnected) {
        this.initializeChat();
      }
    });

    // Subscribe to messages
    this.chatService.messages$.subscribe((messages) => {
      this.messages = messages;
      this.scrollToBottom();
    });

    // Subscribe to connection status
    this.isConnected = true; // Simplified for now
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }

  initializeChat(): void {
    this.loading = true;

    void this.chatService.initializeSocketConnection().finally(() => {
      this.loading = false;
      this.loadOnlineUsers();
    });
  }

  loadOnlineUsers(): void {
    this.chatService.getOnlineUsers().subscribe({
      next: (users) => {
        this.onlineUsers = users;
      },
      error: (error) => {
        console.error('Error loading online users:', error);
      },
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    this.newMessage = '';
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  formatMessageTime(timestamp: string): string {
    return this.chatService.formatMessageTime(timestamp);
  }

  getOnlineUsersCount(): number {
    return this.onlineUsers.length;
  }

  toggleOnlineUsers(): void {
    this.showOnlineUsers = !this.showOnlineUsers;
  }

  isCurrentUser(senderId: number): boolean {
    return this.currentUser?.id === senderId;
  }

  getSenderDisplayName(sender: any): string {
    if (sender.role === 'admin') {
      return `${sender.email} (Admin)`;
    }
    return sender.email;
  }
}
