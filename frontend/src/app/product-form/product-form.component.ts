import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../interfaces/category.ts';
import { ProductService } from '../services/product.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Product } from '../interfaces/products.ts';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  product: Product = {
    id: 0,
    name: '',
    price: 0,
    categoryId: 0,
    createdAt: '',
  };
  categories: Category[] = [];
  selectedFile: File | null = null;
  errorMessage: string | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
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
