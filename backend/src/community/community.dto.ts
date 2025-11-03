export interface CreateCommunityPostDto {
  content: string;
  imageUrl?: string;
  caption: string;
  postType?:
    | 'GENERAL'
    | 'PRODUCT_REVIEW'
    | 'LIFESTYLE'
    | 'TRENDS'
    | 'ADMIN_ANNOUNCEMENT';
  productId?: number;
}

export interface UpdateCommunityPostDto {
  content?: string;
  imageUrl?: string;
  caption?: string;
  postType?:
    | 'GENERAL'
    | 'PRODUCT_REVIEW'
    | 'LIFESTYLE'
    | 'TRENDS'
    | 'ADMIN_ANNOUNCEMENT';
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
