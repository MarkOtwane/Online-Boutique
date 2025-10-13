import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../interfaces/products';
import { ProductService } from '../services/product.service';

import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

import { MatSnackBar } from '@angular/material/snack-bar';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  errorMessage: string | null = null;
  isLoading: boolean = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.errorMessage = null;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Please log in to view products.';
        this.products = [];
        this.isLoading = false;
      },
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.snackBar.open(`${product.name} added to cart!`, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
    });
  }

  editProduct(id: number): void {
    this.router.navigate([`/add-product/${id}`]);
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.isLoading = true;
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter((p) => p.id !== id);
          this.snackBar.open('Product deleted successfully!', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = `Failed to delete product: ${err.message}`;
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          this.isLoading = false;
        },
      });
    }
  }
}
