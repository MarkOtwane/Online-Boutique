import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../interfaces/product';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  selectedImageIndex = 0;
  quantity = 1;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Related products
  relatedProducts: Product[] = [];

  // Mock images for demonstration (in real app, these would come from the product data)
  productImages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.setupProductImages(product);
        this.loadRelatedProducts(product);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage = 'Product not found';
        this.isLoading = false;
      },
    });
  }

  setupProductImages(product: Product): void {
    // In a real app, this would come from the product data
    // For now, we'll create a mock array of images
    this.productImages = [
      product.imageUrl ||
        `https://via.placeholder.com/600x600/cccccc/666666?text=${encodeURIComponent(
          product.name
        )}`,
      `https://via.placeholder.com/600x600/e0e0e0/666666?text=Image+2`,
      `https://via.placeholder.com/600x600/f0f0f0/666666?text=Image+3`,
      `https://via.placeholder.com/600x600/f5f5f5/666666?text=Image+4`,
    ];
  }

  loadRelatedProducts(product: Product): void {
    // Load products from the same category
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.relatedProducts = products
          .filter(
            (p) =>
              p.id !== product.id && p.category?.name === product.category?.name
          )
          .slice(0, 4);
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      },
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  increaseQuantity(): void {
    this.quantity += 1;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  onQuantityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (value && value > 0) {
      this.quantity = value;
    } else {
      this.quantity = 1;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/product/${this.product.id}` },
      });
      return;
    }

    this.cartService.addToCart(
      {
        id: this.product.id,
        name: this.product.name,
        price: this.product.price,
        imageUrl: this.product.imageUrl || '',
      },
      this.quantity
    );

    this.successMessage = `Added ${this.quantity} item(s) to cart!`;
    setTimeout(() => (this.successMessage = ''), 3000);
  }

  buyNow(): void {
    this.addToCart();
    if (this.successMessage) {
      this.router.navigate(['/cart']);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  getDiscountPercentage(originalPrice: number, salePrice: number): number {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
