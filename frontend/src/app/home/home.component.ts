import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { Product } from '../interfaces/product';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  recentProducts: Product[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    this.loadRecentProducts();
  }

  loadRecentProducts(): void {
    this.loading = true;
    this.productService.getRecentProducts().subscribe({
      next: (products) => {
        this.recentProducts = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recent products:', error);
        this.loading = false;
      }
    });
  }

  onPurchase(product: Product): void {
    // Redirect to login if not authenticated, otherwise add to cart
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
    } else {
      this.cartService.addToCart({
        id: product.id,
        name: product.name,
        price: product.price
      }, 1);
      // Show success message or redirect to cart
      alert('Product added to cart!');
      this.router.navigate(['/cart']);
    }
  }

  getProductImageUrl(product: Product): string {
    // Return a placeholder image URL or the actual product image
    return product.imageUrl || `https://via.placeholder.com/300x400/cccccc/666666?text=${encodeURIComponent(product.name)}`;
  }
}
