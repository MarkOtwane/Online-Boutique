import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Category } from '../interfaces/category';
import { Product } from '../interfaces/product';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  product: Product = {
    id: 0,
    name: '',
    price: 0,
    categoryId: 0,
    createdAt: '',
    commentCount: 0,
    repostCount: 0,
  };
  categories: Category[] = [];
  selectedFile: File | null = null;
  errorMessage: string | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'You must be logged in to manage products';
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/add-product' }
      });
      return;
    }

    this.productService.getCategories().subscribe((categories) => {
      this.categories = categories;
      if (categories.length > 0) {
        this.product.categoryId = categories[0].id;
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(+id).subscribe({
        next: (product) => (this.product = product),
        error: () => (this.errorMessage = 'Failed to load product'),
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    // Double-check authentication before submitting
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'You must be logged in to manage products';
      this.router.navigate(['/login']);
      return;
    }

    if (this.product.id === 0) {
      this.productService
        .createProduct(this.product, this.selectedFile || undefined)
        .subscribe({
          next: () => this.router.navigate(['/products']),
          error: (err) =>
            (this.errorMessage = `Failed to create product: ${err.message}`),
        });
    } else {
      this.productService
        .updateProduct(
          this.product.id,
          this.product,
          this.selectedFile || undefined
        )
        .subscribe({
          next: () => this.router.navigate(['/products']),
          error: (err) =>
            (this.errorMessage = `Failed to update product: ${err.message}`),
        });
    }
  }
}
