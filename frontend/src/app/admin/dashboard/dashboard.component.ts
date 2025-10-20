import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  // KPI Data
  totalSales = 34456.0;
  totalOrders = 3456;
  totalRevenue = 1456.0;
  totalCustomers = 42456;

  salesChange = 14;
  ordersChange = -17;
  revenueChange = 14;
  customersChange = -11;

  // Chart Data
  revenueData = [
    { month: 'Jan', current: 15, previous: 20 },
    { month: 'Feb', current: 25, previous: 18 },
    { month: 'Mar', current: 35, previous: 25 },
    { month: 'Apr', current: 28, previous: 35 },
    { month: 'May', current: 32, previous: 30 },
    { month: 'Jun', current: 38, previous: 32 },
  ];

  // Top Selling Products
  topProducts = [
    {
      name: 'Elegant Dress',
      price: 89.99,
      category: 'Women',
      quantity: 156,
      amount: 14035.44,
    },
    {
      name: 'Classic Suit',
      price: 199.99,
      category: 'Men',
      quantity: 89,
      amount: 17799.11,
    },
    {
      name: 'Casual Shirt',
      price: 49.99,
      category: 'Men',
      quantity: 234,
      amount: 11697.66,
    },
    {
      name: 'Summer Blouse',
      price: 39.99,
      category: 'Women',
      quantity: 198,
      amount: 7918.02,
    },
    {
      name: 'Denim Jeans',
      price: 69.99,
      category: 'Unisex',
      quantity: 167,
      amount: 11688.33,
    },
    {
      name: 'Winter Jacket',
      price: 149.99,
      category: 'Unisex',
      quantity: 78,
      amount: 11699.22,
    },
  ];

  // Sales by Location
  locationData = [
    { city: 'New York', sales: 72000 },
    { city: 'San Francisco', sales: 39000 },
    { city: 'Sydney', sales: 25000 },
    { city: 'Singapore', sales: 61000 },
  ];

  // Monthly Target
  monthlyTarget = 75.34;
  targetIncrease = 12;
  todayEarnings = 3267;
  targetAmount = 25000;
  currentRevenue = 18000;
  todayRevenue = 1800;

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Load dashboard data
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // In a real application, this would fetch data from the API
    console.log('Loading dashboard data...');
  }

  getChangeClass(change: number): string {
    return change >= 0 ? 'positive' : 'negative';
  }

  getChangeIcon(change: number): string {
    return change >= 0 ? '↑' : '↓';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }
}
