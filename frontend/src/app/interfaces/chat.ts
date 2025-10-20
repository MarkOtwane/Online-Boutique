export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    email: string;
    role: string;
  };
  receiver: {
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
}

export interface CreateMessageRequest {
  receiverId: number;
  content: string;
}

export interface ChatUser {
  id: number;
  email: string;
  role: string;
  isOnline?: boolean;
  lastSeen?: string;
}
