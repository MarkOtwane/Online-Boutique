import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../products/products';

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

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData = {
        name: this.productForm.value.name,
        price: this.productForm.value.price,
      };
      this.productService.createProduct(productData).subscribe({
        next: (product: Product) => {
          this.successMessage = `Product "${product.name}" added successfully!`;
          this.errorMessage = null;
          this.productForm.reset();
          setTimeout(() => this.router.navigate(['/products']), 2000); // Redirect after 2 seconds
        },
        error: (err: any) => {
          this.errorMessage = `Failed to add product: ${err.message || 'Unknown error'}`;
          this.successMessage = null;
        },
      });
    } else {
      this.errorMessage = 'Please fill out the form correctly.';
      this.successMessage = null;
    }
  }
}
