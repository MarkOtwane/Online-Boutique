export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;
  content: string;
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

export interface ChatConversation {
  id: string;
  participant1Id: number;
  participant2Id: number;
  myKeyBundle: string;
  participants: {
    id: number;
    email: string;
    role: string;
    chatPublicKey?: string | null;
    isOnline?: boolean;
    lastSeen?: string;
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageRequest {
  conversationId: string;
  encryptedContent: string;
  iv: string;
  algorithm?: string;
  clientMessageId?: string;
}

export interface ChatUser {
  id: number;
  email: string;
  role: string;
  chatPublicKey?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
}
