import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CommunityPost,
  CommunityComment,
  CommunityReaction,
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

  // Community Posts
  createCommunityPost(post: CreateCommunityPostDto): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.apiUrl}/posts`, post);
  }

  getCommunityPosts(filters?: CommunityPostFilters): Observable<CommunityPost[]> {
    let httpParams = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<CommunityPost[]>(`${this.apiUrl}/posts`, { params: httpParams });
  }

  getCommunityPost(postId: number): Observable<CommunityPost> {
    return this.http.get<CommunityPost>(`${this.apiUrl}/posts/${postId}`);
  }

  updateCommunityPost(postId: number, updates: Partial<CreateCommunityPostDto>): Observable<CommunityPost> {
    return this.http.put<CommunityPost>(`${this.apiUrl}/posts/${postId}`, updates);
  }

  deleteCommunityPost(postId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/posts/${postId}`);
  }

  // Comments
  addComment(postId: number, comment: CreateCommunityCommentDto): Observable<CommunityComment> {
    return this.http.post<CommunityComment>(`${this.apiUrl}/posts/${postId}/comments`, comment);
  }

  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/comments/${commentId}`);
  }

  // Reactions
  toggleReaction(postId: number): Observable<{ message: string; reaction: CommunityReaction | null }> {
    return this.http.post<{ message: string; reaction: CommunityReaction | null }>(
      `${this.apiUrl}/posts/${postId}/reactions`,
      {},
    );
  }

  // Reposts
  repost(postId: number, content?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}/reposts`, { content });
  }

  // Filtered queries
  getPostsByType(postType: string): Observable<CommunityPost[]> {
    return this.http.get<CommunityPost[]>(`${this.apiUrl}/posts/type/${postType}`);
  }

  getPostsByUser(userId: number): Observable<CommunityPost[]> {
    return this.http.get<CommunityPost[]>(`${this.apiUrl}/posts/user/${userId}`);
  }

  getProductCommunityPosts(productId: number): Observable<CommunityPost[]> {
    return this.http.get<CommunityPost[]>(`${this.apiUrl}/posts/product/${productId}`);
  }
}