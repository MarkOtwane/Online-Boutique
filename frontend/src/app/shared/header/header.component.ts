import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    public cartService: CartService
  ) {}

  get cartItemCount(): number {
    return this.cartService.getValue().reduce((sum: number, item: any) => sum + item.quantity, 0);
  }

  logout(): void {
    this.authService.logout();
  }

  onLogoClick(): void {
    this.authService.navigateToDashboard();
  }
}
