import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CommunityPost,
  CommunityComment,
  CommunityReaction,
  CommunityDiscussion,
  CommunityChatMessage,
  CreateCommunityPostDto,
  CreateCommunityCommentDto,
  CommunityPostFilters,
} from '../interfaces/community-post';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private apiUrl = `${environment.apiUrl}/community`;

  constructor(private http: HttpClient) {}

  private getHeaders(isMultipart = false): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    return new HttpHeaders(headers);
  }

  // Community Posts
  createCommunityPost(
    post: CreateCommunityPostDto | FormData,
  ): Observable<CommunityPost> {
    if (post instanceof FormData) {
      return this.http.post<CommunityPost>(`${this.apiUrl}/posts`, post, {
        headers: this.getHeaders(true),
      });
    }

    return this.http.post<CommunityPost>(`${this.apiUrl}/posts`, post, {
      headers: this.getHeaders(),
    });
  }

  getCommunityPosts(
    filters?: CommunityPostFilters,
  ): Observable<CommunityPost[]> {
    let httpParams = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<CommunityPost[]>(`${this.apiUrl}/posts`, {
      params: httpParams,
      headers: this.getHeaders(),
    });
  }

  getCommunityPost(postId: number): Observable<CommunityPost> {
    return this.http.get<CommunityPost>(`${this.apiUrl}/posts/${postId}`, {
      headers: this.getHeaders(),
    });
  }

  updateCommunityPost(
    postId: number,
    updates: Partial<CreateCommunityPostDto>,
  ): Observable<CommunityPost> {
    return this.http.put<CommunityPost>(
      `${this.apiUrl}/posts/${postId}`,
      updates,
      {
        headers: this.getHeaders(),
      },
    );
  }

  deleteCommunityPost(postId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/posts/${postId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  // Comments
  getCommunityPostComments(postId: number): Observable<CommunityComment[]> {
    return this.http.get<CommunityComment[]>(
      `${this.apiUrl}/posts/${postId}/comments`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  addComment(
    postId: number,
    comment: CreateCommunityCommentDto,
  ): Observable<CommunityComment> {
    return this.http.post<CommunityComment>(
      `${this.apiUrl}/posts/${postId}/comments`,
      comment,
      {
        headers: this.getHeaders(),
      },
    );
  }

  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/comments/${commentId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  // Reactions
  toggleReaction(
    postId: number,
  ): Observable<{ message: string; reaction: CommunityReaction | null }> {
    return this.http.post<{
      message: string;
      reaction: CommunityReaction | null;
    }>(
      `${this.apiUrl}/posts/${postId}/reactions`,
      {},
      { headers: this.getHeaders() },
    );
  }

  likePost(
    postId: number,
  ): Observable<{ message: string; reaction: CommunityReaction | null }> {
    return this.http.post<{
      message: string;
      reaction: CommunityReaction | null;
    }>(
      `${this.apiUrl}/posts/${postId}/like`,
      {},
      { headers: this.getHeaders() },
    );
  }

  unlikePost(
    postId: number,
  ): Observable<{ message: string; reaction: CommunityReaction | null }> {
    return this.http.delete<{
      message: string;
      reaction: CommunityReaction | null;
    }>(`${this.apiUrl}/posts/${postId}/like`, { headers: this.getHeaders() });
  }

  // Reposts
  repost(postId: number, content?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/posts/${postId}/reposts`,
      { content },
      {
        headers: this.getHeaders(),
      },
    );
  }

  // Discussions
  createDiscussion(
    productId: number,
    message: string,
  ): Observable<CommunityDiscussion> {
    return this.http.post<CommunityDiscussion>(
      `${this.apiUrl}/discussions`,
      { productId, message },
      { headers: this.getHeaders() },
    );
  }

  getDiscussions(productId: number): Observable<CommunityDiscussion[]> {
    return this.http.get<CommunityDiscussion[]>(
      `${this.apiUrl}/discussions/${productId}`,
      { headers: this.getHeaders() },
    );
  }

  // Chat history
  getCommunityChatMessages(limit = 100): Observable<CommunityChatMessage[]> {
    return this.http.get<CommunityChatMessage[]>(
      `${this.apiUrl}/chat/messages`,
      {
        headers: this.getHeaders(),
        params: { limit },
      },
    );
  }

  sendCommunityChatMessage(message: string): Observable<CommunityChatMessage> {
    return this.http.post<CommunityChatMessage>(
      `${this.apiUrl}/chat/messages`,
      { message },
      { headers: this.getHeaders() },
    );
  }

  // Filtered queries
  getPostsByType(postType: string): Observable<CommunityPost[]> {
    return this.http.get<CommunityPost[]>(
      `${this.apiUrl}/posts/type/${postType}`,
    );
  }

  getPostsByUser(userId: number): Observable<CommunityPost[]> {
    return this.http.get<CommunityPost[]>(
      `${this.apiUrl}/posts/user/${userId}`,
    );
  }

  getProductCommunityPosts(productId: number): Observable<CommunityPost[]> {
    return this.http.get<CommunityPost[]>(
      `${this.apiUrl}/posts/product/${productId}`,
    );
  }
}
