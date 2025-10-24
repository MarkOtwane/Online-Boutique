import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CartItem } from '../interfaces/cart-item';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  selectedPaymentMethod: string = 'MPESA';
  phoneNumber: string = '';
  paymentMethods = [
    { value: 'MPESA', label: 'M-Pesa' },
    { value: 'CARD', label: 'Card Payment' },
    { value: 'CASH', label: 'Cash on Delivery' }
  ];

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

    if (this.selectedPaymentMethod === 'MPESA' && !this.phoneNumber) {
      this.errorMessage = 'Phone number is required for M-Pesa payments.';
      this.snackBar.open(this.errorMessage, 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      return;
    }

    // First create the order
    const orderData = { items: this.cartService.getOrderItems() };
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });

    this.http
      .post('http://localhost:3000/orders', orderData, { headers })
      .subscribe({
        next: (orderResponse: any) => {
          if (this.selectedPaymentMethod === 'MPESA') {
            this.initiateMpesaPayment(orderResponse.id);
          } else {
            this.successMessage =
              'Order placed successfully! Redirecting to dashboard...';
            this.errorMessage = null;
            this.snackBar.open(this.successMessage, 'Close', {
              duration: 3000,
              verticalPosition: 'top',
            });
            this.cartService.clearCart();
            setTimeout(() => this.router.navigate(['/dashboard']), 2000);
          }
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

  private initiateMpesaPayment(orderId: number): void {
    const paymentData = {
      orderId,
      paymentMethod: 'MPESA',
      phoneNumber: this.phoneNumber,
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });

    this.http
      .post('http://localhost:3000/payments/initiate', paymentData, { headers })
      .subscribe({
        next: (paymentResponse: any) => {
          this.successMessage = `Payment initiated successfully! ${paymentResponse.message}. Please check your phone for the M-Pesa prompt.`;
          this.errorMessage = null;
          this.snackBar.open(this.successMessage, 'Close', {
            duration: 5000,
            verticalPosition: 'top',
          });
          this.cartService.clearCart();
          setTimeout(() => this.router.navigate(['/dashboard']), 3000);
        },
        error: (err) => {
          this.errorMessage = `Failed to initiate payment: ${
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
