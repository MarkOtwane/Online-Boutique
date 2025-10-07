import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Category } from '../category.ts';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isEditMode = false;
  productId: number | null = null;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      categoryId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.productService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.productId = +id;
        this.productService.getProduct(this.productId).subscribe({
          next: (product) => {
            this.productForm.patchValue({
              name: product.name,
              price: product.price,
              categoryId: product.categoryId,
            });
          },
          error: (err: any) => {
            this.errorMessage = `Failed to load product: ${err.message}`;
          },
        });
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData = {
        name: this.productForm.value.name,
        price: this.productForm.value.price,
        categoryId: this.productForm.value.categoryId,
      };
      if (this.isEditMode && this.productId) {
        this.productService
          .updateProduct(this.productId, productData)
          .subscribe({
            next: (product) => {
              this.successMessage = `Product "${product.name}" updated successfully!`;
              this.errorMessage = null;
              this.productForm.reset();
              setTimeout(() => this.router.navigate(['/products']), 2000);
            },
            error: (err: any) => {
              this.errorMessage = `Failed to update product: ${err.message}`;
              this.successMessage = null;
            },
          });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: (product) => {
            this.successMessage = `Product "${product.name}" added successfully!`;
            this.errorMessage = null;
            this.productForm.reset();
            setTimeout(() => this.router.navigate(['/products']), 2000);
          },
          error: (err: any) => {
            this.errorMessage = `Failed to add product: ${err.message}`;
            this.successMessage = null;
          },
        });
      }
    } else {
      this.errorMessage = 'Please fill out the form correctly.';
      this.successMessage = null;
    }
  }
}
