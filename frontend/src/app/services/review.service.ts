import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Review {
  id: number;
  productId: number;
  userId: number;
  title?: string;
  content: string;
  rating: number;
  verifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
  reviewImages: string[];
  user: {
    id: number;
    email: string;
  };
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
  helpfulness: Array<{
    isHelpful: boolean;
    userId: number;
  }>;
}

export interface CreateReviewDto {
  productId: number;
  content: string;
  rating: number;
  title?: string;
  reviewImages?: string[];
  verifiedPurchase?: boolean;
}

export interface UpdateReviewDto {
  content?: string;
  rating?: number;
  title?: string;
  reviewImages?: string[];
}

export interface ReviewQueryParams {
  productId?: number;
  userId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
  sortOrder?: 'asc' | 'desc';
  ratingFilter?: number;
  onlyVerified?: boolean;
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  distribution: { [key: number]: number };
}

export interface CanUserReview {
  canReview: boolean;
  hasPurchased: boolean;
  hasReviewed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  createReview(review: CreateReviewDto): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  getReviews(params?: ReviewQueryParams): Observable<{reviews: Review[], pagination: any}> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<{reviews: Review[], pagination: any}>(this.apiUrl, { params: httpParams });
  }

  getProductReviews(productId: number, params?: Partial<ReviewQueryParams>): Observable<{reviews: Review[], pagination: any}> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<{reviews: Review[], pagination: any}>(`${this.apiUrl}/product/${productId}`, { params: httpParams });
  }

  getUserReviews(userId: number, params?: Partial<ReviewQueryParams>): Observable<{reviews: Review[], pagination: any}> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<{reviews: Review[], pagination: any}>(`${this.apiUrl}/user/${userId}`, { params: httpParams });
  }

  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  updateReview(id: number, review: UpdateReviewDto): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}`, review);
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  markHelpful(reviewId: number, isHelpful: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/${reviewId}/helpful`, { isHelpful });
  }

  getReviewStatistics(productId: number): Observable<ReviewStatistics> {
    return this.http.get<ReviewStatistics>(`${this.apiUrl}/statistics/${productId}`);
  }

  canUserReview(productId: number): Observable<CanUserReview> {
    return this.http.get<CanUserReview>(`${this.apiUrl}/can-review/${productId}`);
  }

  approveReview(id: number): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}/approve`, {});
  }

  getPendingReviews(page = 1, limit = 10): Observable<{reviews: Review[], pagination: any}> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<{reviews: Review[], pagination: any}>(`${this.apiUrl}/pending`, { params });
  }
}