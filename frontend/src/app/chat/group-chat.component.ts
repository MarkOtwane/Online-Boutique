import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { ChatMessage, ChatConversation } from '../interfaces/chat';
import { User } from '../interfaces/user';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.css']
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (user && !this.isConnected) {
        this.initializeChat();
      }
    });

    // Subscribe to messages
    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      this.scrollToBottom();
    });

    // Subscribe to connection status
    this.isConnected = true; // Simplified for now
  }

  ngOnDestroy(): void {
    if (this.globalGroupChat) {
      this.chatService.leaveGlobalGroupChat(this.globalGroupChat.id);
    }
  }

  initializeChat(): void {
    this.loading = true;
    this.chatService.initializeSocketConnection();
    
    this.chatService.getGlobalGroupChat().subscribe({
      next: (groupChat) => {
        this.globalGroupChat = groupChat;
        this.chatService.joinGlobalGroupChat(groupChat.id);
        this.chatService.loadConversationMessages(groupChat.id);
        this.loading = false;
        
        // Load online users
        this.loadOnlineUsers();
      },
      error: (error) => {
        console.error('Error loading global group chat:', error);
        this.loading = false;
      }
    });
  }

  loadOnlineUsers(): void {
    this.chatService.getOnlineUsers().subscribe({
      next: (users) => {
        this.onlineUsers = users;
      },
      error: (error) => {
        console.error('Error loading online users:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.globalGroupChat) {
      return;
    }

    const messageContent = this.newMessage.trim();
    this.newMessage = '';

    // Send real-time message
    this.chatService.sendGlobalGroupMessage(this.globalGroupChat.id, messageContent);

    // Also send via HTTP as backup
    this.chatService.sendMessage({
      conversationId: this.globalGroupChat.id,
      receiverId: undefined,
      content: messageContent
    }).subscribe({
      next: (message) => {
        console.log('Message sent successfully:', message);
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
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