import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Order } from '../interfaces/order';
import { AuthService } from '../services/auth.service';

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
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  errorMessage: string | null = null;
  isAdmin: boolean = false;
  selectedOrder: Order | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.getUser()?.role === 'admin';
    const endpoint = this.isAdmin ? '/orders/all' : '/orders';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });

    this.http
      .get<Order[]>(`http://localhost:3000${endpoint}`, { headers })
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

  showDetails(orderId: number): void {
    this.selectedOrder =
      this.orders.find((order) => order.id === orderId) || null;
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Order #${this.selectedOrder?.id}\nTotal: $${
          this.selectedOrder?.total
        }\nUser: ${
          this.selectedOrder?.user?.email || 'N/A'
        }\nItems:\n${this.selectedOrder?.orderItems
          .map((item) => `${item.name} - ${item.quantity} x $${item.price}`)
          .join('\n')}`,
      },
    });
  }
}
