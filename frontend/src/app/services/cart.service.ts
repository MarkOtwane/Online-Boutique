import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../interfaces/cart-item';
import { OrderService, CreateOrderRequest } from './order.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();

  constructor(private orderService: OrderService) {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItemsSubject.next(JSON.parse(savedCart));
    }
  }

  getValue(): CartItem[] {
    return this.cartItemsSubject.getValue();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItemsSubject.getValue()));
  }

  addToCart(
    product: { id: number; name: string; price: number; imageUrl?: string },
    quantity: number = 1
  ): void {
    const currentItems = this.cartItemsSubject.getValue();
    const existingItem = currentItems.find(
      (item) => item.id === product.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
      });
    }

    this.cartItemsSubject.next([...currentItems]);
    this.saveToLocalStorage();
  }

  removeFromCart(itemId: number): void {
    const currentItems = this.cartItemsSubject.getValue();
    const updatedItems = currentItems.filter(
      (item) => item.id !== itemId
    );
    this.cartItemsSubject.next(updatedItems);
    this.saveToLocalStorage();
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    const items = this.cartItemsSubject.getValue();
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      if (newQuantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        items[itemIndex].quantity = newQuantity;
        this.cartItemsSubject.next([...items]);
        this.saveToLocalStorage();
      }
    }
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.saveToLocalStorage();
  }

  getTotal(): number {
    return this.cartItemsSubject
      .getValue()
      .reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getOrderItems(): { productId: number; quantity: number }[] {
    return this.cartItemsSubject.getValue().map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));
  }

  createOrderFromCart(): Observable<any> {
    const orderData: CreateOrderRequest = {
      items: this.getOrderItems(),
    };
    return this.orderService.createOrder(orderData);
  }
}
