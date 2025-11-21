import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Order } from '../interfaces/order';
import { AuthService } from '../services/auth.service';
import {
  OrderStatusUpdate,
  OrderTrackingUpdate,
  OrderUpdatesService,
} from '../services/order-updates.service';
import { TrackingService } from '../services/tracking.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  errorMessage: string | null = null;
  isAdmin: boolean = false;
  selectedOrder: Order | null = null;

  // Real-time updates
  recentUpdates: OrderStatusUpdate[] = [];
  orderTrackingUpdates: Map<number, OrderTrackingUpdate> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private orderUpdatesService: OrderUpdatesService,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.getUser()?.role === 'admin';
    this.loadOrders();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadOrders(): void {
    const endpoint = this.isAdmin ? '/orders/all' : '/orders';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });

    this.http
      .get<Order[]>(`${API_CONFIG.BASE_URL}${endpoint}`, { headers })
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.errorMessage = null;
        },
        error: (err) => {
          this.errorMessage = `Failed to load orders: ${
            err.error.message || err.message
          }`;
          this.orders = [];
        },
      });
  }

  private setupRealTimeUpdates(): void {
    // Subscribe to order status updates
    const statusSub = this.orderUpdatesService.orderUpdates$.subscribe(
      (updates) => {
        this.recentUpdates = updates;
        this.updateOrdersWithUpdates(updates);
      }
    );

    // Subscribe to tracking updates
    const trackingSub = this.orderUpdatesService.trackingUpdates$.subscribe(
      (updates) => {
        updates.forEach((update) => {
          this.orderTrackingUpdates.set(update.orderId, update);
        });
      }
    );

    this.subscriptions.push(statusSub, trackingSub);
  }

  private updateOrdersWithUpdates(updates: OrderStatusUpdate[]): void {
    this.orders = this.orders.map((order) => {
      const update = updates.find((u) => u.orderId === order.id);
      if (update) {
        return {
          ...order,
          status: update.status,
          lastUpdated: new Date(update.timestamp),
        };
      }
      return order;
    });
  }

  trackOrder(orderId: number): void {
    // Navigate to tracking page with order ID
    this.router.navigate(['/tracking'], {
      queryParams: { orderId: orderId.toString() },
    });
  }

  viewTrackingDetails(orderId: number): void {
    this.router.navigate(['/tracking'], {
      queryParams: { orderId: orderId.toString(), details: 'true' },
    });
  }

  getOrderTrackingStatus(orderId: number): OrderTrackingUpdate | null {
    return this.orderTrackingUpdates.get(orderId) || null;
  }

  hasTrackingForOrder(orderId: number): boolean {
    return this.orderTrackingUpdates.has(orderId);
  }

  // Auto-track order method that automatically shows tracking button when order is shipped
  autoTrackOrder(orderId: number): void {
    // Use the orders endpoint to get tracking info
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });

    this.http
      .get<any>(`${API_CONFIG.BASE_URL}/orders/${orderId}/tracking`, {
        headers,
      })
      .subscribe({
        next: (data: any) => {
          if (data.tracking && data.tracking.trackingId) {
            // Automatically navigate to tracking
            this.router.navigate(['/tracking'], {
              queryParams: {
                id: data.tracking.trackingId,
                orderId: orderId.toString(),
              },
            });
          } else {
            // No tracking available yet, show message
            console.log('No tracking available for order', orderId);
          }
        },
        error: (error: any) => {
          console.error('Error fetching tracking:', error);
        },
      });
  }

  // Check if order should show tracking button (automatically shows when shipped or later)
  shouldShowTrackingButton(order: any): boolean {
    const status = order.status?.toLowerCase();
    return (
      !this.isAdmin &&
      (status === 'shipped' || status === 'completed' || status === 'delivered')
    );
  }

  showDetails(orderId: number): void {
    this.selectedOrder =
      this.orders.find((order) => order.id === orderId) || null;
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Order #${this.selectedOrder?.id}\nTotal: KSh ${
          this.selectedOrder?.total
        }\nUser: ${
          this.selectedOrder?.user?.email || 'N/A'
        }\nItems:\n${this.selectedOrder?.orderItems
          .map((item) => `${item.name} - ${item.quantity} x KSh ${item.price}`)
          .join('\n')}`,
      },
    });
  }
}
