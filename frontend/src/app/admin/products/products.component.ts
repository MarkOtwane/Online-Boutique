import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product';
import { Category } from '../../interfaces/category';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class AdminProductsComponent implements OnInit {
  Math = Math;
  products: Product[] = [];
  categories: Category[] = [];
  filteredProducts: Product[] = [];
  selectedProducts: number[] = [];
  isLoading = true;
  
  // Search and filter
  searchTerm = '';
  selectedCategory = '';
  sortBy = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  
  // Modal states
  showDeleteModal = false;
  showBulkDeleteModal = false;
  productToDelete: Product | null = null;
  
  // Success/Error messages
  successMessage = '';
  errorMessage = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'Failed to load products';
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product =>
        product.category?.name === this.selectedCategory
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortBy as keyof Product];
      let bValue: any = b[this.sortBy as keyof Product];

      if (this.sortBy === 'category') {
        aValue = a.category?.name || '';
        bValue = b.category?.name || '';
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredProducts = filtered;
    this.currentPage = 1; // Reset to first page
  }

  onSearch(): void {
    this.applyFilters();
  }

  onCategoryFilter(): void {
    this.applyFilters();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return '↕️';
    return this.sortOrder === 'asc' ? '↑' : '↓';
  }

  // Pagination
  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  // Selection
  toggleProductSelection(productId: number): void {
    const index = this.selectedProducts.indexOf(productId);
    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    } else {
      this.selectedProducts.push(productId);
    }
  }

  toggleSelectAll(): void {
    const currentPageProductIds = this.paginatedProducts.map(p => p.id);
    const allCurrentPageSelected = currentPageProductIds.every(id => 
      this.selectedProducts.includes(id)
    );

    if (allCurrentPageSelected) {
      // Deselect all current page products
      this.selectedProducts = this.selectedProducts.filter(id => 
        !currentPageProductIds.includes(id)
      );
    } else {
      // Select all current page products
      currentPageProductIds.forEach(id => {
        if (!this.selectedProducts.includes(id)) {
          this.selectedProducts.push(id);
        }
      });
    }
  }

  get isAllCurrentPageSelected(): boolean {
    const currentPageProductIds = this.paginatedProducts.map(p => p.id);
    return currentPageProductIds.every(id => this.selectedProducts.includes(id));
  }

  // Delete operations
  confirmDelete(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  deleteProduct(): void {
    if (!this.productToDelete) return;

    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        this.successMessage = `Product "${this.productToDelete!.name}" deleted successfully`;
        this.loadProducts();
        this.showDeleteModal = false;
        this.productToDelete = null;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = `Failed to delete product: ${error.message}`;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  confirmBulkDelete(): void {
    if (this.selectedProducts.length === 0) return;
    this.showBulkDeleteModal = true;
  }

  bulkDeleteProducts(): void {
    const deletePromises = this.selectedProducts.map(id => 
      this.productService.deleteProduct(id).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.successMessage = `${this.selectedProducts.length} products deleted successfully`;
      this.selectedProducts = [];
      this.loadProducts();
      this.showBulkDeleteModal = false;
      setTimeout(() => this.successMessage = '', 3000);
    }).catch(error => {
      this.errorMessage = `Failed to delete some products: ${error.message}`;
      setTimeout(() => this.errorMessage = '', 3000);
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.showBulkDeleteModal = false;
    this.productToDelete = null;
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getProductImageUrl(product: Product): string {
    return product.imageUrl || `https://via.placeholder.com/100x100/cccccc/666666?text=${encodeURIComponent(product.name.substring(0, 2))}`;
  }
}
