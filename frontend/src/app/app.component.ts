import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { User } from './interfaces/user.interface';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, FormsModule, MatToolbarModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'frontend';
  isAuthenticated: boolean;
  cartItemCount: number = 0;

  constructor(public authService: AuthService, private cartService: CartService) {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.authService.user$.subscribe((user) => {
      this.isAuthenticated = !!user;
    });

    // Subscribe to cart items to track the count
    this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.length;
    });
  }

  get currentUser(): User | null {
    return this.authService.getUser();
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
  }
}
