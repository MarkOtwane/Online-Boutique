import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';

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

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
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
            });
          },
          error: (err) => {
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
            error: (err) => {
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
          error: (err) => {
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
