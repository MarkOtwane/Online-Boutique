import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/products';
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$: Observable<Product[]> = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialProducts(); // Load products on service initialization
  }

  private loadInitialProducts(): void {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (products) => this.productsSubject.next(products),
      error: (err) => console.error('Failed to load products:', err)
    });
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return new Observable<Product>((observer) => {
      this.http.post<Product>(this.apiUrl, product).subscribe({
        next: (newProduct) => {
          const currentProducts = this.productsSubject.getValue();
          this.productsSubject.next([...currentProducts, newProduct]);
          observer.next(newProduct);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return new Observable<Product>((observer) => {
      this.http.put<Product>(`${this.apiUrl}/${id}`, product).subscribe({
        next: (updatedProduct) => {
          const currentProducts = this.productsSubject.getValue();
          const updatedProducts = currentProducts.map((p) =>
            p.id === id ? updatedProduct : p
          );
          this.productsSubject.next(updatedProducts);
          observer.next(updatedProduct);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  deleteProduct(id: number): Observable<Product> {
    return new Observable<Product>((observer) => {
      this.http.delete<Product>(`${this.apiUrl}/${id}`).subscribe({
        next: (deletedProduct) => {
          const currentProducts = this.productsSubject.getValue();
          this.productsSubject.next(currentProducts.filter((p) => p.id !== id));
          observer.next(deletedProduct);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}