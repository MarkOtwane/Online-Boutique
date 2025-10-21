import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: number;
  activeUsers: number;
  salesChange: number;
  ordersChange: number;
  revenueChange: number;
  customersChange: number;
}

export interface TopProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
  amount: number;
  imageUrl: string | null;
}

export interface RevenueData {
  month: string;
  current: number;
  previous: number;
}

export interface LocationData {
  city: string;
  sales: number;
}

export interface UserDashboardData {
  totalOrders: number;
  totalSpent: number;
  recentOrders: any[];
  memberSince: string;
  accountStatus: string;
}

export interface ReportData {
  type: string;
  period: {
    startDate?: Date;
    endDate?: Date;
  };
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Admin Dashboard Methods
  getAdminStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/admin/stats`, {
      headers: this.getHeaders()
    });
  }

  getTopProducts(limit: number = 6): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.apiUrl}/dashboard/admin/top-products?limit=${limit}`, {
      headers: this.getHeaders()
    });
  }

  getRevenueData(): Observable<RevenueData[]> {
    return this.http.get<RevenueData[]>(`${this.apiUrl}/dashboard/admin/revenue-data`, {
      headers: this.getHeaders()
    });
  }

  getLocationData(): Observable<LocationData[]> {
    return this.http.get<LocationData[]>(`${this.apiUrl}/dashboard/admin/location-data`, {
      headers: this.getHeaders()
    });
  }

  generateReport(
    type: 'sales' | 'products' | 'customers',
    startDate?: Date,
    endDate?: Date
  ): Observable<ReportData> {
    let url = `${this.apiUrl}/dashboard/admin/report?type=${type}`;
    
    if (startDate) {
      url += `&startDate=${startDate.toISOString()}`;
    }
    if (endDate) {
      url += `&endDate=${endDate.toISOString()}`;
    }

    return this.http.get<ReportData>(url, {
      headers: this.getHeaders()
    });
  }

  // User Dashboard Methods
  getUserDashboard(): Observable<UserDashboardData> {
    return this.http.get<UserDashboardData>(`${this.apiUrl}/dashboard/user`, {
      headers: this.getHeaders()
    });
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getChangeClass(change: number): string {
    return change >= 0 ? 'positive' : 'negative';
  }

  getChangeIcon(change: number): string {
    return change >= 0 ? '↑' : '↓';
  }

  // Export report as CSV
  exportReportAsCSV(reportData: ReportData): void {
    let csvContent = '';
    const headers = this.getReportHeaders(reportData.type);
    csvContent += headers.join(',') + '\n';

    const rows = this.getReportRows(reportData);
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportData.type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private getReportHeaders(type: string): string[] {
    switch (type) {
      case 'sales':
        return ['Order ID', 'Date', 'Customer', 'Total', 'Status'];
      case 'products':
        return ['Product ID', 'Product Name', 'Category', 'Quantity Sold', 'Order Count'];
      case 'customers':
        return ['Customer ID', 'Email', 'Total Orders', 'Total Spent'];
      default:
        return [];
    }
  }

  private getReportRows(reportData: ReportData): string[][] {
    switch (reportData.type) {
      case 'sales':
        return reportData['orders']?.map((order: any) => [
          order.id.toString(),
          new Date(order.createdAt).toLocaleDateString(),
          order.user?.email || 'N/A',
          this.formatCurrency(order.total),
          order.status || 'Processing'
        ]) || [];
      
      case 'products':
        return reportData['products']?.map((product: any) => [
          product.id?.toString() || 'N/A',
          product.name || 'N/A',
          product.category || 'N/A',
          product.quantitySold?.toString() || '0',
          product.orderCount?.toString() || '0'
        ]) || [];
      
      case 'customers':
        return reportData['customers']?.map((customer: any) => [
          customer.user?.id?.toString() || 'N/A',
          customer.user?.email || 'N/A',
          customer.totalOrders?.toString() || '0',
          this.formatCurrency(customer.totalSpent || 0)
        ]) || [];
      
      default:
        return [];
    }
  }
}
