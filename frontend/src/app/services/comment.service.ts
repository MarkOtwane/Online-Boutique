import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../interfaces/comment';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getProductComments(productId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/products/${productId}/comments`, {
      headers: this.getHeaders(),
    });
  }

  createComment(commentData: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments`, commentData, {
      headers: this.getHeaders(),
    });
  }

  updateComment(commentId: number, commentData: UpdateCommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${commentId}`, commentData, {
      headers: this.getHeaders(),
    });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`, {
      headers: this.getHeaders(),
    });
  }

  replyToComment(parentId: number, content: string, productId: number): Observable<Comment> {
    const replyData: CreateCommentRequest = {
      productId,
      content,
      parentId,
    };
    return this.createComment(replyData);
  }

  getAllDiscussions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/discussions`, {
      headers: this.getHeaders(),
    });
  }

  searchDiscussions(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/discussions/search`, {
      headers: this.getHeaders(),
      params: { q: query },
    });
  }

  markAsAdminResponse(commentId: number): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${commentId}/admin-response`, {}, {
      headers: this.getHeaders(),
    });
  }
}
