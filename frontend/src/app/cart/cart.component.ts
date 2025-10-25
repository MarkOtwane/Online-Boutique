import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartItem } from '../interfaces/cart-item';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  checkoutForm: CheckoutForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'credit',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  };

  // UI States
  showCheckoutForm = false;
  isProcessing = false;
  showSuccessModal = false;

  // Messages
  successMessage = '';
  errorMessage = '';

  // Form validation
  formErrors: { [key: string]: string } = {};

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
    this.prefillUserData();
  }

  loadCartItems(): void {
    this.cartService.getCartItems().subscribe((items) => {
      this.cartItems = items;
    });
  }

  prefillUserData(): void {
    // Pre-fill with user data if available
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.checkoutForm.email = user.email;
        // Add more user data fields as available
      }
    });
  }

  // Cart operations
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item.id);
      return;
    }

    this.cartService.updateQuantity(item.id, newQuantity);
    this.loadCartItems();
  }

  updateQuantityFromInput(item: CartItem, event: Event): void {
    const target = event.target as HTMLInputElement;
    const newQuantity = parseInt(target.value) || 1;
    this.updateQuantity(item, newQuantity);
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId);
    this.loadCartItems();
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.loadCartItems();
  }

  // Calculations
  getSubtotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  getShipping(): number {
    // Free shipping over KSh 50
    return this.getSubtotal() >= 50 ? 0 : 9.99;
  }

  getTax(): number {
    // 8.5% tax
    return this.getSubtotal() * 0.085;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  }

  // Checkout
  proceedToCheckout(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }

    if (this.cartItems.length === 0) {
      this.errorMessage = 'Your cart is empty';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    this.showCheckoutForm = true;
  }

  submitOrder(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    // Create order with backend API
    this.cartService.createOrderFromCart().subscribe({
      next: (order) => {
        console.log('Order placed successfully:', order);
        this.isProcessing = false;
        this.showSuccessModal = true;
        this.cartService.clearCart();
        this.loadCartItems();
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.errorMessage = 'Failed to place order. Please try again.';
        this.isProcessing = false;
      }
    });
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    // Required fields validation
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'address',
      'city',
      'state',
      'zipCode',
    ];

    for (const field of requiredFields) {
      if (!this.checkoutForm[field as keyof CheckoutForm]) {
        this.formErrors[field] = `${this.getFieldDisplayName(
          field
        )} is required`;
        isValid = false;
      }
    }

    // Email validation
    if (
      this.checkoutForm.email &&
      !this.isValidEmail(this.checkoutForm.email)
    ) {
      this.formErrors['email'] = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation (optional but if provided, should be valid)
    if (
      this.checkoutForm.phone &&
      !this.isValidPhone(this.checkoutForm.phone)
    ) {
      this.formErrors['phone'] = 'Please enter a valid phone number';
      isValid = false;
    }

    // Payment validation
    if (this.checkoutForm.paymentMethod === 'credit') {
      if (
        !this.checkoutForm.cardNumber ||
        !this.checkoutForm.expiryDate ||
        !this.checkoutForm.cvv
      ) {
        this.formErrors['payment'] = 'Please complete payment information';
        isValid = false;
      }
    }

    return isValid;
  }

  getFieldDisplayName(field: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
    };
    return displayNames[field] || field;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  getFieldError(field: string): string {
    return this.formErrors[field] || '';
  }

  // Modal controls
  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/']);
  }

  continueShopping(): void {
    this.showCheckoutForm = false;
    this.router.navigate(['/products']);
  }
}
