import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: number;
  activeUsers: number;
}

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit {
  stats: DashboardStats | null = null;
  topProducts: TopProduct[] = [];
  revenueData: RevenueData[] = [];
  locationData: any[] = [];

  loading = false;
  selectedPeriod = '30'; // days
  chartType = 'revenue';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    this.loading = true;

    // Load all analytics data
    this.dashboardService.getAdminStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading = false;
      }
    });

    this.dashboardService.getTopProducts(10).subscribe({
      next: (products) => {
        this.topProducts = products;
      },
      error: (error) => {
        console.error('Error loading top products:', error);
      }
    });

    this.dashboardService.getRevenueData().subscribe({
      next: (data) => {
        this.revenueData = data;
      },
      error: (error) => {
        console.error('Error loading revenue data:', error);
      }
    });

    this.dashboardService.getLocationData().subscribe({
      next: (data) => {
        this.locationData = data;
      },
      error: (error) => {
        console.error('Error loading location data:', error);
      }
    });
  }

  onPeriodChange(): void {
    this.loadAnalyticsData();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  getChartData(): any[] {
    if (this.chartType === 'revenue') {
      return this.revenueData.map(item => ({
        name: this.formatDate(item.date),
        value: item.revenue
      }));
    } else {
      return this.revenueData.map(item => ({
        name: this.formatDate(item.date),
        value: item.orders
      }));
    }
  }

  getMaxValue(): number {
    const data = this.getChartData();
    return Math.max(...data.map(item => item.value));
  }

  exportReport(): void {
    // Create CSV content
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(): string {
    const headers = ['Metric', 'Value', 'Date'];
    const rows = [
      ['Total Users', this.stats?.totalUsers || 0, new Date().toLocaleDateString()],
      ['Total Orders', this.stats?.totalOrders || 0, new Date().toLocaleDateString()],
      ['Total Products', this.stats?.totalProducts || 0, new Date().toLocaleDateString()],
      ['Total Revenue', this.stats?.totalRevenue || 0, new Date().toLocaleDateString()],
      ['Recent Orders (30 days)', this.stats?.recentOrders || 0, new Date().toLocaleDateString()],
      ['Active Users', this.stats?.activeUsers || 0, new Date().toLocaleDateString()],
    ];

    const csvArray = [headers, ...rows];
    return csvArray.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  }
}