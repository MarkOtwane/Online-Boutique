import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../interfaces/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItemsSubject.next(JSON.parse(savedCart));
    }
  }

  addToCart(
    product: { id: number; name: string; price: number },
    quantity: number = 1
  ): void {
    const currentItems = this.cartItemsSubject.getValue();
    const existingItem = currentItems.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    this.cartItemsSubject.next([...currentItems]);
    localStorage.setItem('cart', JSON.stringify(currentItems));
  }

  removeFromCart(productId: number): void {
    const currentItems = this.cartItemsSubject.getValue();
    const updatedItems = currentItems.filter(
      (item) => item.productId !== productId
    );
    this.cartItemsSubject.next(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentItems = this.cartItemsSubject.getValue();
    const item = currentItems.find((item) => item.productId === productId);
    if (item && quantity > 0) {
      item.quantity = quantity;
      this.cartItemsSubject.next([...currentItems]);
      localStorage.setItem('cart', JSON.stringify(currentItems));
    } else if (item && quantity <= 0) {
      this.removeFromCart(productId);
    }
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    localStorage.removeItem('cart');
  }

  getTotal(): number {
    return this.cartItemsSubject
      .getValue()
      .reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getOrderItems(): { productId: number; quantity: number }[] {
    return this.cartItemsSubject.getValue().map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
  }
}
