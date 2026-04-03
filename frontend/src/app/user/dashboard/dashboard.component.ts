import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import {
  DashboardService,
  UserDashboardData,
} from '../../services/dashboard.service';
import { TrackingService } from '../../services/tracking.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly trackingService = inject(TrackingService);
  private readonly chatService = inject(ChatService);
  private readonly subscriptions = new Subscription();

  user: any = null;
  dashboardData: UserDashboardData = {
    totalOrders: 0,
    totalSpent: 0,
    recentOrders: [],
    memberSince: '',
    accountStatus: 'Active',
  };
  activeCustomers = 0;
  messageCount = 0;
  isLoading = true;
  metrics: Array<{
    label: string;
    value: string | number;
    detail: string;
    icon: 'orders' | 'revenue' | 'customers' | 'messages';
  }> = [];
  activityFeed: Array<{ title: string; copy: string; time: string }> = [];

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
    this.loadLiveMetrics();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadUserData(): void {
    this.user = this.authService.getUser();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    this.dashboardService.getUserDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.refreshMetrics();
        this.activityFeed = this.buildActivityFeed(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      },
    });
  }

  loadLiveMetrics(): void {
    this.subscriptions.add(
      this.chatService.getOnlineUsers().subscribe({
        next: (users) => {
          this.activeCustomers = users.filter(
            (user) => user.id !== this.user?.id,
          ).length;
          this.refreshMetrics();
        },
        error: () => {
          this.activeCustomers = 0;
          this.refreshMetrics();
        },
      }),
    );

    this.subscriptions.add(
      this.chatService.getConversations().subscribe({
        next: (conversations) => {
          this.messageCount = conversations.reduce(
            (total, conversation) => total + (conversation.unreadCount || 0),
            0,
          );
          this.chatService.updateConversations(conversations);
          this.refreshMetrics();
        },
        error: () => {
          this.messageCount = 0;
          this.refreshMetrics();
        },
      }),
    );
  }

  get hasRecentOrders(): boolean {
    return (this.dashboardData.recentOrders?.length || 0) > 0;
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
      currency: 'KES',
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getTotalSpent(): number {
    return this.dashboardData.totalSpent;
  }

  getRecentOrders(): any[] {
    return this.dashboardData.recentOrders;
  }

  private refreshMetrics(): void {
    if (!this.dashboardData) {
      return;
    }

    this.metrics = [
      {
        label: 'Total orders',
        value: this.dashboardData.totalOrders,
        detail: 'All completed and pending orders in your account.',
        icon: 'orders',
      },
      {
        label: 'Total spent',
        value: this.formatCurrency(this.dashboardData.totalSpent),
        detail: 'Lifetime spend across every checkout.',
        icon: 'revenue',
      },
      {
        label: 'Active customers',
        value: this.activeCustomers,
        detail: 'Shoppers currently active across the platform.',
        icon: 'customers',
      },
      {
        label: 'Unread messages',
        value: this.messageCount,
        detail: 'Open conversations waiting for your reply.',
        icon: 'messages',
      },
    ];
  }

  private buildActivityFeed(
    data: UserDashboardData,
  ): Array<{ title: string; copy: string; time: string }> {
    const feed: Array<{ title: string; copy: string; time: string }> = [];

    if (data.recentOrders?.length) {
      const latestOrder = data.recentOrders[0];
      feed.push({
        title: `Order #${latestOrder.id} updated`,
        copy: `Your order is currently ${latestOrder.status || 'processing'}.`,
        time: this.formatDate(latestOrder.date || latestOrder.createdAt),
      });
    }

    feed.push({
      title: 'Account status checked',
      copy: `Member since ${this.getMemberSince() || 'today'} with ${data.accountStatus} access.`,
      time: 'Just now',
    });

    feed.push({
      title: 'Shopping activity synced',
      copy: `${this.activeCustomers} customers are active right now and ${this.messageCount} messages are unread.`,
      time: 'Live',
    });

    return feed;
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
      },
    });
  }
}
