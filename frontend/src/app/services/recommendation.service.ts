import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductRecommendation {
  id: number;
  userId: number;
  productId: number;
  recommendationType: 'collaborative' | 'content_based' | 'trending' | 'personalized';
  score: number;
  reason: string;
  createdAt: string;
  isViewed: boolean;
  isClicked: boolean;
  isPurchased: boolean;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
    category: {
      id: number;
      name: string;
    };
    averageRating: number;
    reviewCount: number;
  };
  user: {
    id: number;
    email: string;
  };
}

export interface TrackBehaviorDto {
  userId: number;
  productId?: number;
  actionType: 'view' | 'cart_add' | 'purchase' | 'review' | 'search';
  metadata?: any;
  sessionId?: string;
}

export interface GetRecommendationsQuery {
  userId?: number;
  limit?: number;
  recommendationTypes?: string[];
  sortBy?: 'score' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface RecommendationStats {
  total: number;
  clicked: number;
  purchased: number;
  clickThroughRate: number;
  conversionRate: number;
  byType: Array<{
    type: string;
    count: number;
    averageScore: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) {}

  getRecommendations(params?: GetRecommendationsQuery): Observable<ProductRecommendation[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => httpParams = httpParams.append(key, v.toString()));
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }
    return this.http.get<ProductRecommendation[]>(this.apiUrl, { params: httpParams });
  }

  generateRecommendations(userId?: number, limit = 10): Observable<ProductRecommendation[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('userId', (userId || '').toString());
    return this.http.post<ProductRecommendation[]>(`${this.apiUrl}/generate`, {}, { params });
  }

  batchGenerateRecommendations(): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/batch-generate`, {});
  }

  trackBehavior(behavior: TrackBehaviorDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/track`, behavior);
  }

  updateRecommendationInteraction(productId: number, updates: {
    isViewed?: boolean;
    isClicked?: boolean;
    isPurchased?: boolean;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}/interaction`, updates);
  }

  getRecommendationStats(userId?: number): Observable<RecommendationStats> {
    const params = userId ? new HttpParams().set('userId', userId.toString()) : new HttpParams();
    return this.http.get<RecommendationStats>(`${this.apiUrl}/stats`, { params });
  }

  getAllRecommendationStats(): Observable<RecommendationStats> {
    return this.http.get<RecommendationStats>(`${this.apiUrl}/stats/admin`);
  }

  // Helper methods for common tracking scenarios
  trackProductView(userId: number, productId: number, sessionId?: string): void {
    this.trackBehavior({
      userId,
      productId,
      actionType: 'view',
      sessionId
    }).subscribe();
  }

  trackAddToCart(userId: number, productId: number, sessionId?: string): void {
    this.trackBehavior({
      userId,
      productId,
      actionType: 'cart_add',
      sessionId
    }).subscribe();
  }

  trackPurchase(userId: number, productId: number, sessionId?: string): void {
    this.trackBehavior({
      userId,
      productId,
      actionType: 'purchase',
      sessionId
    }).subscribe();
  }

  trackSearch(userId: number, searchTerm: string, sessionId?: string): void {
    this.trackBehavior({
      userId,
      actionType: 'search',
      metadata: { searchTerm },
      sessionId
    }).subscribe();
  }

  trackReview(userId: number, productId: number, sessionId?: string): void {
    this.trackBehavior({
      userId,
      productId,
      actionType: 'review',
      sessionId
    }).subscribe();
  }

  // Get personalized recommendations for a user
  getPersonalizedRecommendations(userId: number, limit = 10): Observable<ProductRecommendation[]> {
    return this.getRecommendations({
      userId,
      limit,
      recommendationTypes: ['personalized', 'collaborative', 'content_based'],
      sortBy: 'score',
      sortOrder: 'desc'
    });
  }

  // Get trending recommendations
  getTrendingRecommendations(limit = 10): Observable<ProductRecommendation[]> {
    return this.getRecommendations({
      limit,
      recommendationTypes: ['trending'],
      sortBy: 'score',
      sortOrder: 'desc'
    });
  }

  // Mark recommendation as viewed/clicked
  markRecommendationViewed(recommendationId: number): Observable<any> {
    return this.updateRecommendationInteraction(recommendationId, { isViewed: true });
  }

  markRecommendationClicked(recommendationId: number): Observable<any> {
    return this.updateRecommendationInteraction(recommendationId, { isClicked: true });
  }

  markRecommendationPurchased(recommendationId: number): Observable<any> {
    return this.updateRecommendationInteraction(recommendationId, { isPurchased: true });
  }
}