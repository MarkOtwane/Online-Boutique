import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, UserDashboardData } from '../../services/dashboard.service';
import { TrackingService } from '../../services/tracking.service';
import { TrackingInfo } from '../../interfaces/tracking';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  user: any = null;
  dashboardData: UserDashboardData = {
    totalOrders: 0,
    totalSpent: 0,
    recentOrders: [],
    memberSince: '',
    accountStatus: 'Active'
  };
  isLoading = true;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
  }

  loadUserData(): void {
    this.user = this.authService.getUser();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    this.dashboardService.getUserDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
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
      currency: 'KES'
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
    return this.dashboardData.totalSpent;
  }

  getRecentOrders(): any[] {
    return this.dashboardData.recentOrders;
  }

  getMemberSince(): string {
    return this.dashboardService.formatDate(this.dashboardData.memberSince);
  }

  trackOrder(order: any): void {
    // First try to get tracking info for the order
    this.trackingService.getOrderTracking(order.id).subscribe({
      next: (trackingInfo) => {
        if (trackingInfo && trackingInfo.trackingId) {
          // Navigate to tracking page with tracking ID
          window.location.href = `/tracking?id=${trackingInfo.trackingId}`;
        } else {
          // If no tracking info found, show a message
          alert('Tracking information is not available for this order yet.');
        }
      },
      error: (error) => {
        console.error('Error fetching tracking info:', error);
        alert('Unable to fetch tracking information. Please try again later.');
      }
    });
  }
}
