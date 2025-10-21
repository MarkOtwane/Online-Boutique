import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

export interface CreateOrderRequest {
  items: { productId: number; quantity: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.ORDERS.BASE}`, orderData, {
      headers: this.getHeaders(),
    });
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.ORDERS.BASE}`, {
      headers: this.getHeaders(),
    });
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.ORDERS.ALL}`, {
      headers: this.getHeaders(),
    });
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.ORDERS.BASE}/${orderId}/status`, { status }, {
      headers: this.getHeaders(),
    });
  }
}
