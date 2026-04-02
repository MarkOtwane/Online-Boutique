import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatConversation, ChatMessage, ChatUser } from '../interfaces/chat';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';
import { ChatCryptoService } from '../services/chat-crypto.service';
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
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private chatCryptoService: ChatCryptoService,
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.currentUser = user;
      if (user && (user.role === 'customer' || user.role === 'admin')) {
        void this.chatService.initializeSocketConnection();
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
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.chatService.disconnect();
  }

  loadConversations(): void {
    this.loading = true;
    this.chatService.getConversations().subscribe({
      next: async (conversations) => {
        this.conversations = await Promise.all(
          conversations.map(async (conversation) => {
            if (!conversation.lastMessage) {
              return conversation;
            }

            try {
              await this.chatCryptoService.setConversationKeyFromBundle(
                conversation.id,
                conversation.myKeyBundle,
              );
              const content = await this.chatCryptoService.decryptMessage(
                conversation.id,
                conversation.lastMessage.encryptedContent,
                conversation.lastMessage.iv,
              );

              return {
                ...conversation,
                lastMessage: {
                  ...conversation.lastMessage,
                  content,
                },
              };
            } catch (_error) {
              return conversation;
            }
          }),
        );
        this.chatService.updateConversations(this.conversations);
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
          (user) => user.id !== this.currentUser?.id,
        );
      },
      error: (error) => {
        console.error('Error loading online users:', error);
      },
    });
  }

  selectConversation(conversation: ChatConversation): void {
    this.chatService.setActiveConversation(conversation);
    this.markMessagesAsRead();
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

  async startConversation(): Promise<void> {
    if (!this.selectedUser) return;

    if (!this.selectedUser.chatPublicKey) {
      console.error('Selected user has no chat public key registered');
      return;
    }

    const keyBundles = await this.chatCryptoService.buildConversationKeyBundles(
      this.selectedUser.chatPublicKey,
    );

    this.chatService
      .createConversation(
        this.selectedUser.id,
        keyBundles.initiatorKeyBundle,
        keyBundles.recipientKeyBundle,
      )
      .subscribe({
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

    const plainText = this.newMessage.trim();
    this.newMessage = '';
    this.emitTyping(false);

    void this.chatService.sendEncryptedMessage(plainText);
  }

  onMessageInput(): void {
    this.emitTyping(true);

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => {
      this.emitTyping(false);
    }, 1000);
  }

  getReceiverInfo(): ChatUser | null {
    if (!this.activeConversation || !this.currentUser) return null;

    return (
      this.activeConversation.participants.find(
        (participant) => participant.id !== this.currentUser!.id,
      ) || null
    );
  }

  getConversationReceiverInfo(conversation: ChatConversation): ChatUser | null {
    if (!conversation || !this.currentUser) return null;

    return (
      conversation.participants.find(
        (participant) => participant.id !== this.currentUser!.id,
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
      if (!message.isRead && message.senderId !== this.currentUser?.id) {
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

  private emitTyping(isTyping: boolean): void {
    if (!this.activeConversation) {
      return;
    }

    this.chatService.sendTypingStatus(this.activeConversation.id, isTyping);
  }
}
