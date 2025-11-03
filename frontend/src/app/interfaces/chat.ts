export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId?: number | null; // null for group messages
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    email: string;
    role: string;
  };
  receiver?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface ChatConversation {
  id: number;
  participants: {
    id: number;
    email: string;
    role: string;
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isGlobalGroup?: boolean;
}

export interface CreateMessageRequest {
  conversationId: number;
  receiverId?: number | null; // null for group messages
  content: string;
}

export interface ChatUser {
  id: number;
  email: string;
  role: string;
  isOnline?: boolean;
  lastSeen?: string;
}
