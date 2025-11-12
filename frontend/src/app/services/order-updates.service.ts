import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api.config';
import { ChatService } from './chat.service';

export interface OrderStatusUpdate {
  orderId: number;
  status: string;
  previousStatus: string;
  timestamp: string;
  orderDetails: any;
}

export interface OrderTrackingUpdate {
  orderId: number;
  trackingId: string;
  status: string;
  location: string;
  notes: string;
  timestamp: string;
  estimatedDelivery?: string;
  deliveredDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderUpdatesService {
  private socket: Socket | null = null;
  private orderUpdatesSubject = new BehaviorSubject<OrderStatusUpdate[]>([]);
  private trackingUpdatesSubject = new BehaviorSubject<OrderTrackingUpdate[]>([]);
  private activeTrackingSubject = new BehaviorSubject<OrderTrackingUpdate | null>(null);

  orderUpdates$ = this.orderUpdatesSubject.asObservable();
  trackingUpdates$ = this.trackingUpdatesSubject.asObservable();
  activeTracking$ = this.activeTrackingSubject.asObservable();

  constructor(private chatService: ChatService) {
    this.initializeOrderUpdates();
  }

  private initializeOrderUpdates(): void {
    // Wait for chat service to initialize socket, then add order-specific listeners
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found for order updates');
      return;
    }

    // Create a separate socket for order updates (or reuse chat socket)
    this.socket = io(API_CONFIG.BASE_URL, {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to order updates server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from order updates server');
    });

    // Listen for order status updates
    this.socket.on('orderStatusUpdate', (data: { userId: number; orderData: OrderStatusUpdate }) => {
      this.handleOrderStatusUpdate(data.orderData);
    });

    // Listen for order tracking updates
    this.socket.on('orderTrackingUpdate', (data: { userId: number; trackingData: OrderTrackingUpdate }) => {
      this.handleOrderTrackingUpdate(data.trackingData);
    });

    // Connect to the chat service's socket if it exists
    this.chatService.initializeSocketConnection();
  }

  private handleOrderStatusUpdate(update: OrderStatusUpdate): void {
    console.log('Received order status update:', update);
    
    const currentUpdates = this.orderUpdatesSubject.getValue();
    const updated = [update, ...currentUpdates.filter(u => u.orderId !== update.orderId)];
    this.orderUpdatesSubject.next(updated);
  }

  private handleOrderTrackingUpdate(update: OrderTrackingUpdate): void {
    console.log('Received order tracking update:', update);
    
    const currentUpdates = this.trackingUpdatesSubject.getValue();
    const updated = [update, ...currentUpdates.filter(u => u.orderId !== update.orderId)];
    this.trackingUpdatesSubject.next(updated);
    
    // Set as active tracking for display
    this.activeTrackingSubject.next(update);
  }

  // Get updates for a specific order
  getOrderUpdates(orderId: number): Observable<OrderStatusUpdate | null> {
    return new Observable(observer => {
      this.orderUpdates$.subscribe(updates => {
        const orderUpdate = updates.find(u => u.orderId === orderId);
        observer.next(orderUpdate || null);
      });
    });
  }

  // Get tracking updates for a specific order
  getTrackingUpdates(orderId: number): Observable<OrderTrackingUpdate | null> {
    return new Observable(observer => {
      this.trackingUpdates$.subscribe(updates => {
        const trackingUpdate = updates.find(u => u.orderId === orderId);
        observer.next(trackingUpdate || null);
      });
    });
  }

  // Check if an order has active tracking
  hasActiveTracking(orderId: number): Observable<boolean> {
    return new Observable(observer => {
      this.trackingUpdates$.subscribe(updates => {
        const hasTracking = updates.some(u => u.orderId === orderId);
        observer.next(hasTracking);
      });
    });
  }

  // Get current active tracking for an order
  getCurrentTracking(orderId: number): OrderTrackingUpdate | null {
    return this.activeTrackingSubject.getValue();
  }

  // Clear updates for testing
  clearUpdates(): void {
    this.orderUpdatesSubject.next([]);
    this.trackingUpdatesSubject.next([]);
    this.activeTrackingSubject.next(null);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}