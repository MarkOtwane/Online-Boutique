export interface CommunityPost {
  id: number;
  userId: number;
  productId?: number;
  content: string;
  imageUrl?: string;
  caption: string;
  postType: 'GENERAL' | 'PRODUCT_REVIEW' | 'LIFESTYLE' | 'TRENDS' | 'ADMIN_ANNOUNCEMENT';
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  reactionCount: number;
  shareCount: number;
  repostCount: number;
  user: {
    id: number;
    email: string;
    role: string;
    isOnline: boolean;
    lastSeen: string;
  };
  product?: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
  reactions: CommunityReaction[];
  comments: CommunityComment[];
  reposts: CommunityRepost[];
  _count: {
    reactions: number;
    comments: number;
    reposts: number;
  };
}

export interface CommunityComment {
  id: number;
  communityPostId: number;
  userId: number;
  content: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
  replies: CommunityComment[];
}

export interface CommunityReaction {
  id: number;
  communityPostId: number;
  userId: number;
  type: string;
  createdAt: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface CommunityRepost {
  id: number;
  communityPostId: number;
  userId: number;
  content?: string;
  createdAt: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
  communityPost: CommunityPost;
}

export interface CreateCommunityPostDto {
  content: string;
  imageUrl?: string;
  caption: string;
  postType?: 'GENERAL' | 'PRODUCT_REVIEW' | 'LIFESTYLE' | 'TRENDS' | 'ADMIN_ANNOUNCEMENT';
  productId?: number;
}

export interface CreateCommunityCommentDto {
  content: string;
  parentId?: number;
}

export interface CommunityPostFilters {
  postType?: string;
  userId?: number;
  productId?: number;
}