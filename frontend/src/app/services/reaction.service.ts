import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Reaction {
  id: number;
  productId: number;
  userId: number;
  type: string;
  createdAt: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface ReactionToggleResponse {
  action: 'added' | 'removed';
  reactionCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReactionService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  toggleReaction(productId: number): Observable<ReactionToggleResponse> {
    return this.http.post<ReactionToggleResponse>(
      `${this.apiUrl}/reactions/products/${productId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getProductReactions(productId: number): Observable<Reaction[]> {
    return this.http.get<Reaction[]>(
      `${this.apiUrl}/reactions/products/${productId}`,
      { headers: this.getHeaders() }
    );
  }

  getUserReaction(productId: number): Observable<Reaction | null> {
    return this.http.get<Reaction | null>(
      `${this.apiUrl}/reactions/products/${productId}/user`,
      { headers: this.getHeaders() }
    );
  }
}