import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackingService } from '../../services/tracking.service';
import { TrackingInfo, CreateTrackingDto, UpdateTrackingDto, TrackingStats } from '../../interfaces/tracking';

@Component({
  selector: 'app-tracking-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-management.component.html',
  styleUrl: './tracking-management.component.css'
})
export class TrackingManagementComponent implements OnInit {
  trackings: any[] = [];
  stats: TrackingStats | null = null;
  loading: boolean = false;
  selectedTracking: TrackingInfo | null = null;

  // Form data
  newTracking: CreateTrackingDto = {
    orderId: 0,
    initialStatus: 'pending',
    location: '',
    notes: ''
  };

  updateData: UpdateTrackingDto = {
    status: '',
    location: '',
    notes: ''
  };

  constructor(private trackingService: TrackingService) {}

  ngOnInit(): void {
    this.loadTrackings();
    this.loadStats();
  }

  loadTrackings(): void {
    this.loading = true;
    this.trackingService.getAllTracking().subscribe({
      next: (data) => {
        this.trackings = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trackings:', error);
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.trackingService.getTrackingStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  createTracking(): void {
    if (!this.newTracking.orderId) return;

    this.trackingService.createTracking(this.newTracking).subscribe({
      next: (result) => {
        console.log('Tracking created:', result);
        this.loadTrackings();
        this.loadStats();
        // Reset form
        this.newTracking = {
          orderId: 0,
          initialStatus: 'pending',
          location: '',
          notes: ''
        };
      },
      error: (error) => {
        console.error('Error creating tracking:', error);
      }
    });
  }

  updateTracking(orderId: number): void {
    this.trackingService.updateTracking(orderId, this.updateData).subscribe({
      next: () => {
        this.loadTrackings();
        this.selectedTracking = null;
        this.updateData = {
          status: '',
          location: '',
          notes: ''
        };
      },
      error: (error) => {
        console.error('Error updating tracking:', error);
      }
    });
  }

  selectTracking(tracking: any): void {
    this.selectedTracking = tracking;
    this.updateData = {
      status: tracking.currentStatus || '',
      location: '',
      notes: ''
    };
  }

  getOrderIdFromTracking(tracking: any): number {
    // Assuming tracking has orderId field, or we need to extract it from trackingId
    return tracking.orderId || parseInt(tracking.trackingId.split('-')[1]) || 0;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'in-transit': 'bg-indigo-100 text-indigo-800',
      'out-for-delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
