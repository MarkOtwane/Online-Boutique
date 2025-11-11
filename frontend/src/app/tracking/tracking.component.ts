import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrackingService } from '../services/tracking.service';
import { TrackingInfo } from '../interfaces/tracking';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tracking',
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.css'
})
export class TrackingComponent implements OnInit {
  trackingId: string = '';
  trackingInfo: TrackingInfo | null = null;
  loading: boolean = false;
  error: string = '';

  constructor(
    private trackingService: TrackingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if tracking ID is provided in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const trackingId = urlParams.get('id');
    if (trackingId) {
      this.trackingId = trackingId;
      this.searchTracking();
    }
  }

  searchTracking(): void {
    if (!this.trackingId.trim()) {
      this.error = 'Please enter a tracking ID';
      return;
    }

    this.loading = true;
    this.error = '';
    this.trackingInfo = null;

    this.trackingService.getTrackingInfo(this.trackingId.trim()).subscribe({
      next: (data) => {
        this.trackingInfo = data;
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 401) {
          this.error = 'Please log in to track your package';
          this.authService.logout();
          setTimeout(() => {
            this.router.navigate(['/login'], { 
              queryParams: { returnUrl: '/tracking' + (this.trackingId ? `?id=${this.trackingId}` : '') }
            });
          }, 2000);
        } else {
          this.error = err.error?.message || 'Tracking information not found';
        }
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'in-transit': 'bg-indigo-100 text-indigo-800',
      'out-for-delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'returned': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTimelineDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  formatDeliveryDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / 86400000);

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays > 1 && diffDays <= 7) {
      return `In ${diffDays} days`;
    } else {
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  getProgressSteps(): Array<{ number: number; label: string; active: boolean; completed: boolean }> {
    const steps = [
      { number: 1, label: 'Order Placed', status: ['pending', 'processing', 'shipped', 'in-transit', 'out-for-delivery', 'delivered'] },
      { number: 2, label: 'Processing', status: ['processing', 'shipped', 'in-transit', 'out-for-delivery', 'delivered'] },
      { number: 3, label: 'Shipped', status: ['shipped', 'in-transit', 'out-for-delivery', 'delivered'] },
      { number: 4, label: 'In Transit', status: ['in-transit', 'out-for-delivery', 'delivered'] },
      { number: 5, label: 'Delivered', status: ['delivered'] }
    ];

    const currentStatus = this.trackingInfo?.currentStatus.toLowerCase() || '';
    
    return steps.map((step, index) => {
      const completed = step.status.includes(currentStatus) && 
                       steps.findIndex(s => s.status.includes(currentStatus)) > index;
      const active = step.status.includes(currentStatus) && 
                    steps.findIndex(s => s.status.includes(currentStatus)) === index;
      
      return {
        number: step.number,
        label: step.label,
        active,
        completed
      };
    });
  }

  getProgressPercentage(): number {
    const statusOrder = ['pending', 'processing', 'shipped', 'in-transit', 'out-for-delivery', 'delivered'];
    const currentStatus = this.trackingInfo?.currentStatus.toLowerCase() || '';
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / statusOrder.length) * 100;
  }

  trackByTimestamp(index: number, item: any): any {
    return item.timestamp;
  }
}
