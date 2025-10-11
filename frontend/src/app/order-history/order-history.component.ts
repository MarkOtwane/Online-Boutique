import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Order } from '../interfaces/order';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  errorMessage: string | null = null;
  isAdmin: boolean = false;

  constructor(private http: HttpClient, private authService: AuthService) {}

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
}
