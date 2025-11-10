import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG, getAuthHeaders } from '../../config/api.config';

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: Date;
  error?: string;
}

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

@Component({
  selector: 'app-email-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './email-management.component.html',
  styleUrl: './email-management.component.css'
})
export class EmailManagementComponent implements OnInit {
  emailLogs: EmailLog[] = [];
  stats: EmailStats | null = null;
  loading: boolean = false;

  // Send email form
  emailData = {
    to: '',
    subject: '',
    template: 'order-confirmation',
    data: {} as any
  };

  templates = [
    { value: 'order-confirmation', label: 'Order Confirmation' },
    { value: 'shipping-update', label: 'Shipping Update' },
    { value: 'delivery-confirmation', label: 'Delivery Confirmation' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEmailLogs();
    this.loadEmailStats();
  }

  loadEmailLogs(): void {
    this.loading = true;
    this.http.get<EmailLog[]>(`${API_CONFIG.BASE_URL}/mailer/logs`, {
      headers: getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.emailLogs = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading email logs:', error);
        this.loading = false;
      }
    });
  }

  loadEmailStats(): void {
    this.http.get<EmailStats>(`${API_CONFIG.BASE_URL}/mailer/stats`, {
      headers: getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => {
        console.error('Error loading email stats:', error);
      }
    });
  }

  sendEmail(): void {
    if (!this.emailData.to || !this.emailData.subject) return;

    this.http.post(`${API_CONFIG.BASE_URL}/mailer/send`, this.emailData, {
      headers: getAuthHeaders()
    }).subscribe({
      next: (result) => {
        console.log('Email sent:', result);
        this.loadEmailLogs();
        this.loadEmailStats();
        // Reset form
        this.emailData = {
          to: '',
          subject: '',
          template: 'order-confirmation',
          data: {}
        };
      },
      error: (error) => {
        console.error('Error sending email:', error);
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'sent': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
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

  updateTemplateData(): void {
    // Set default data based on template
    switch (this.emailData.template) {
      case 'order-confirmation':
        this.emailData.data = {
          orderId: 'ORD-001',
          orderDate: new Date().toISOString(),
          total: 99.99,
          items: [{ name: 'Sample Product', price: 99.99, quantity: 1 }]
        };
        break;
      case 'shipping-update':
        this.emailData.data = {
          orderId: 'ORD-001',
          trackingId: 'TRK-123456',
          status: 'Shipped',
          shippedDate: new Date().toISOString(),
          trackingUrl: `${window.location.origin}/tracking?id=TRK-123456`
        };
        break;
      case 'delivery-confirmation':
        this.emailData.data = {
          orderId: 'ORD-001',
          trackingId: 'TRK-123456',
          deliveredDate: new Date().toISOString(),
          deliveryLocation: '123 Main St, City, State'
        };
        break;
    }
  }
}
