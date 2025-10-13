import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartItem } from '../interfaces/cart-item';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

import { MatSnackBar } from '@angular/material/snack-bar';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
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
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  openConfirmDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to place this order?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.placeOrder();
      }
    });
  }

  placeOrder(): void {
    if (!this.cartItems.length) {
      this.errorMessage = 'Your cart is empty.';
      this.snackBar.open(this.errorMessage, 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
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
          this.snackBar.open(this.successMessage, 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
          this.cartService.clearCart();
          setTimeout(() => this.router.navigate(['/dashboard']), 2000);
        },
        error: (err) => {
          this.errorMessage = `Failed to place order: ${
            err.error.message || err.message
          }`;
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          this.successMessage = null;
        },
      });
  }
}
