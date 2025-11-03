import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  statusFilter = 'all';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Order statistics
  totalOrders = 0;
  pendingOrders = 0;
  completedOrders = 0;
  totalRevenue = 0;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = orders;
        this.calculateStatistics();
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error = 'Failed to load orders. Please check your connection and try again.';
        this.loading = false;
      }
    });
  }

  calculateStatistics(): void {
    this.totalOrders = this.orders.length;
    this.pendingOrders = this.orders.filter(order => order.status === 'pending').length;
    this.completedOrders = this.orders.filter(order => order.status === 'completed').length;
    this.totalRevenue = this.orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.orders;

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchLower) ||
        order.items?.some(item => item.product.name.toLowerCase().includes(searchLower))
      );
    }

    this.filteredOrders = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  getPaginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getTotalItems(order: Order): number {
    return order.items?.reduce((total: number, item) => total + item.quantity, 0) || 0;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'failed': return 'status-failed';
      default: return 'status-default';
    }
  }

  updateOrderStatus(orderId: number, newStatus: string): void {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
          this.applyFilters();
          this.calculateStatistics();
        }
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.error = 'Failed to update order status. Please try again.';
      }
    });
  }

  viewOrderDetails(order: Order): void {
    // Implement order details modal or navigation
    console.log('View order details:', order);
  }
}