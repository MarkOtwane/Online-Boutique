import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repost } from '../interfaces/repost';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class RepostService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  createRepost(productId: number, content?: string): Observable<Repost> {
    return this.http.post<Repost>(
      `${this.apiUrl}/reposts`,
      { productId, content },
      { headers: this.getHeaders() }
    );
  }

  getProductReposts(productId: number): Observable<Repost[]> {
    return this.http.get<Repost[]>(
      `${this.apiUrl}/reposts/products/${productId}`,
      { headers: this.getHeaders() }
    );
  }

  deleteRepost(repostId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reposts/${repostId}`, {
      headers: this.getHeaders(),
    });
  }
}