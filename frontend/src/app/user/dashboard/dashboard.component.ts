import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  user: any = null;
  recentOrders: any[] = [];
  isLoading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadRecentOrders();
  }

  loadUserData(): void {
    this.user = this.authService.getUser();
    this.isLoading = false;
  }

  loadRecentOrders(): void {
    // Mock data - in real app, this would come from API
    this.recentOrders = [
      {
        id: 'ORD-001',
        date: '2025-01-15',
        status: 'Delivered',
        total: 149.99,
        items: [
          { name: 'Elegant Dress', quantity: 1, price: 89.99 },
          { name: 'Classic Shoes', quantity: 1, price: 60.00 }
        ]
      },
      {
        id: 'ORD-002',
        date: '2025-01-10',
        status: 'Shipped',
        total: 89.99,
        items: [
          { name: 'Casual Shirt', quantity: 1, price: 49.99 },
          { name: 'Denim Jeans', quantity: 1, price: 40.00 }
        ]
      },
      {
        id: 'ORD-003',
        date: '2025-01-05',
        status: 'Processing',
        total: 199.99,
        items: [
          { name: 'Winter Jacket', quantity: 1, price: 149.99 },
          { name: 'Wool Scarf', quantity: 1, price: 50.00 }
        ]
      }
    ];
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'processing':
        return 'status-processing';
      default:
        return 'status-default';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTotalSpent(): number {
    return this.recentOrders.reduce((total, order) => total + order.total, 0);
  }
}
