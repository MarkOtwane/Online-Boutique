import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { DashboardService, DashboardStats, TopProduct, RevenueData, LocationData, ReportData } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  // KPI Data
  stats: DashboardStats = {
    totalSales: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    salesChange: 0,
    ordersChange: 0,
    revenueChange: 0,
    customersChange: 0,
  };

  // Chart Data
  revenueData: RevenueData[] = [];
  topProducts: TopProduct[] = [];
  locationData: LocationData[] = [];

  // Monthly Target
  monthlyTarget = 75.34;
  targetIncrease = 12;
  todayEarnings = 3267;
  targetAmount = 25000;
  currentRevenue = 18000;
  todayRevenue = 1800;

  // Loading states
  loading = true;
  reportLoading = false;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    // Load dashboard data
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load all dashboard data in parallel
    const stats$ = this.dashboardService.getAdminStats();
    const products$ = this.dashboardService.getTopProducts(6);
    const revenue$ = this.dashboardService.getRevenueData();
    const location$ = this.dashboardService.getLocationData();

    stats$.subscribe({
      next: (stats) => this.stats = stats,
      error: (error) => console.error('Error loading stats:', error)
    });

    products$.subscribe({
      next: (products) => this.topProducts = products,
      error: (error) => console.error('Error loading products:', error)
    });

    revenue$.subscribe({
      next: (revenue) => this.revenueData = revenue,
      error: (error) => console.error('Error loading revenue:', error)
    });

    location$.subscribe({
      next: (location) => {
        this.locationData = location;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading location:', error);
        this.loading = false;
      }
    });
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

  generateReport(type: 'sales' | 'products' | 'customers'): void {
    this.reportLoading = true;
    
    this.dashboardService.generateReport(type).subscribe({
      next: (reportData) => {
        this.dashboardService.exportReportAsCSV(reportData);
        this.reportLoading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.reportLoading = false;
      }
    });
  }

  exportReport(): void {
    // Generate a comprehensive report with all data
    this.generateReport('sales');
  }
}
