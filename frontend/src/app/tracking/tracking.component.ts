import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackingService } from '../services/tracking.service';
import { TrackingInfo } from '../interfaces/tracking';

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

  constructor(private trackingService: TrackingService) {}

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
        this.error = err.error?.message || 'Tracking information not found';
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

  trackByTimestamp(index: number, item: any): any {
    return item.timestamp;
  }
}
