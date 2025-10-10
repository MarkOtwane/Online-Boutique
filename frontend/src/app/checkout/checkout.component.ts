import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartItem } from '../interfaces/cart-item';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  placeOrder(): void {
    if (!this.cartItems.length) {
      this.errorMessage = 'Your cart is empty.';
      return;
    }

    const orderData = { items: this.cartService.getOrderItems() };
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });

    this.http
      .post('http://localhost:3000/orders', orderData, { headers })
      .subscribe({
        next: () => {
          this.successMessage =
            'Order placed successfully! Redirecting to dashboard...';
          this.errorMessage = null;
          this.cartService.clearCart();
          setTimeout(() => this.router.navigate(['/dashboard']), 2000);
        },
        error: (err) => {
          this.errorMessage = `Failed to place order: ${
            err.error.message || err.message
          }`;
          this.successMessage = null;
        },
      });
  }
}
