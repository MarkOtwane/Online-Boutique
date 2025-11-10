import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getAuthHeaders } from '../config/api.config';
import {
  TrackingInfo,
  CreateTrackingDto,
  UpdateTrackingDto,
  TrackingStats
} from '../interfaces/tracking';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  // Public tracking lookup (no auth required)
  getTrackingInfo(trackingId: string): Observable<TrackingInfo> {
    return this.http.get<TrackingInfo>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.TRACKING.BY_ID(trackingId)}`);
  }

  // Admin methods
  createTracking(dto: CreateTrackingDto): Observable<{ trackingId: string }> {
    return this.http.post<{ trackingId: string }>(
      `${this.apiUrl}${API_CONFIG.ENDPOINTS.TRACKING.BASE}`,
      dto,
      { headers: getAuthHeaders() }
    );
  }

  updateTracking(orderId: number, dto: UpdateTrackingDto): Observable<any> {
    return this.http.put(
      `${this.apiUrl}${API_CONFIG.ENDPOINTS.TRACKING.BY_ORDER(orderId)}`,
      dto,
      { headers: getAuthHeaders() }
    );
  }

  getOrderTracking(orderId: number): Observable<TrackingInfo | null> {
    return this.http.get<TrackingInfo | null>(
      `${this.apiUrl}${API_CONFIG.ENDPOINTS.TRACKING.BY_ORDER(orderId)}`,
      { headers: getAuthHeaders() }
    );
  }

  getAllTracking(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Observable<any[]> {
    let params = new HttpParams();

    if (options?.status) {
      params = params.set('status', options.status);
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }
    if (options?.offset) {
      params = params.set('offset', options.offset.toString());
    }

    return this.http.get<any[]>(
      `${this.apiUrl}${API_CONFIG.ENDPOINTS.TRACKING.BASE}`,
      {
        headers: getAuthHeaders(),
        params
      }
    );
  }

  getTrackingStats(): Observable<TrackingStats> {
    return this.http.get<TrackingStats>(
      `${this.apiUrl}${API_CONFIG.ENDPOINTS.TRACKING.STATS}`,
      { headers: getAuthHeaders() }
    );
  }
}