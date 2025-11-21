import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { API_CONFIG } from '../config/api.config';
import { CartItem } from '../interfaces/cart';
import { Order } from '../interfaces/order';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  errorMessage: string | null = null;
  orders: Order[] = [];
  cartItems: CartItem[] = [];
  totalCartValue = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        if (user) {
          this.loadUserOrders();
        }
      },
      error: (err) => {
        this.errorMessage = `Failed to load user data: ${err.message}`;
        this.authService.logout();
      },
    });

    // Subscribe to cart changes
    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      this.totalCartValue = this.cartService.getTotal();
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  loadUserOrders(): void {
    this.http
      .get<Order[]>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS.BASE}`,
        {
          headers: this.getHeaders(),
        }
      )
      .subscribe({
        next: (orders) => {
          this.orders = orders || [];
        },
        error: (error) => {
          console.error('Error loading orders:', error);
        },
      });
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToOrderHistory(): void {
    this.router.navigate(['/order-history']);
  }

  goToAdminPanel(): void {
    this.router.navigate(['/admin']);
  }
}
