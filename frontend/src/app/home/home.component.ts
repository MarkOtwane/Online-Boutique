import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Product } from '../interfaces/product';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  recentProducts: Product[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

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
}
