import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../interfaces/cart';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated first
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/cart' }
      });
      return;
    }

    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  updateQuantity(item: CartItem, quantity: number): void {
    this.cartService.updateQuantity(item.productId, quantity);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear the cart?')) {
      this.cartService.clearCart();
    }
  }
}
