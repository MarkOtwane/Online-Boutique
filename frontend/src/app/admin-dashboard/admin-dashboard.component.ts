import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from '../interfaces/product';
import { User } from '../interfaces/user';
import { Order } from '../interfaces/order';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  users: User[] = [];
  orders: Order[] = [];
  loading = true;
  activeTab = 'overview';

  // Analytics data
  totalProducts = 0;
  totalUsers = 0;
  totalOrders = 0;
  totalRevenue = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.loadProducts();
    this.loadUsers();
    this.loadOrders();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  loadProducts(): void {
    this.http.get<Product[]>('http://localhost:3000/products', {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.products = response || [];
        this.totalProducts = this.products.length;
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  loadUsers(): void {
    this.http.get<User[]>('http://localhost:3000/users', {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.users = response || [];
        this.totalUsers = this.users.length;
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  loadOrders(): void {
    this.http.get<Order[]>('http://localhost:3000/orders/all', {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.orders = response || [];
        this.totalOrders = this.orders.length;
        this.totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.http.delete(`http://localhost:3000/products/${productId}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== productId);
          this.totalProducts = this.products.length;
        },
        error: (error) => console.error('Error deleting product:', error)
      });
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`http://localhost:3000/users/${userId}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          this.totalUsers = this.users.length;
        },
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }
}
