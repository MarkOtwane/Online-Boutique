import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';

import { TopProduct, RevenueData, LocationData } from '../../services/dashboard.service';

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
  locationData: LocationData[] = [];
  error: string | null = null;

  loading = false;
  selectedPeriod = '30'; // days
  chartType = 'revenue';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    this.loading = true;
    this.error = null;

    // Load all analytics data
    this.dashboardService.getAdminStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.error = 'Failed to load dashboard statistics. Please check your connection and try again.';
        this.loading = false;
      }
    });

    this.dashboardService.getTopProducts(10).subscribe({
      next: (products) => {
        this.topProducts = products;
      },
      error: (error) => {
        console.error('Error loading top products:', error);
        this.error = 'Failed to load top products data.';
      }
    });

    this.dashboardService.getRevenueData().subscribe({
      next: (data) => {
        this.revenueData = data;
      },
      error: (error) => {
        console.error('Error loading revenue data:', error);
        this.error = 'Failed to load revenue data.';
      }
    });

    this.dashboardService.getLocationData().subscribe({
      next: (data) => {
        this.locationData = data;
      },
      error: (error) => {
        console.error('Error loading location data:', error);
        this.error = 'Failed to load location data.';
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
        name: item.month,
        value: item.current
      }));
    } else {
      return this.revenueData.map(item => ({
        name: item.month,
        value: item.previous
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
      ['Total Customers', this.stats?.totalCustomers || 0, new Date().toLocaleDateString()],
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