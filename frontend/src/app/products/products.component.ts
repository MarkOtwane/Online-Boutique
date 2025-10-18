import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../interfaces/product';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  errorMessage: string | null = null;
  isLoading: boolean = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  get currentUser() {
    return this.authService.getUser();
  }

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
