import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product';
import { Category } from '../category.ts';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000';
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$: Observable<Product[]> = this.productsSubject.asObservable();
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$: Observable<Category[]> = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  private loadInitialData(): void {
    this.http.get<Product[]>(`${this.apiUrl}/products`).subscribe({
      next: (products) => this.productsSubject.next(products),
      error: (err) => console.error('Failed to load products:', err),
    });
    this.http.get<Category[]>(`${this.apiUrl}/categories`).subscribe({
      next: (categories) => this.categoriesSubject.next(categories),
      error: (err) => console.error('Failed to load categories:', err),
    });
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  createProduct(product: Product): Observable<Product> {
    return new Observable<Product>((observer) => {
      this.http
        .post<Product>(`${this.apiUrl}/products`, product, {
          headers: this.getHeaders(),
        })
        .subscribe({
          next: (newProduct) => {
            const currentProducts = this.productsSubject.getValue();
            this.productsSubject.next([...currentProducts, newProduct]);
            observer.next(newProduct);
            observer.complete();
          },
          error: (err) => observer.error(err),
        });
    });
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return new Observable<Product>((observer) => {
      this.http
        .put<Product>(`${this.apiUrl}/products/${id}`, product, {
          headers: this.getHeaders(),
        })
        .subscribe({
          next: (updatedProduct) => {
            const currentProducts = this.productsSubject.getValue();
            const updatedProducts = currentProducts.map((p) =>
              p.id === id ? updatedProduct : p
            );
            this.productsSubject.next(updatedProducts);
            observer.next(updatedProduct);
            observer.complete();
          },
          error: (err) => observer.error(err),
        });
    });
  }

  deleteProduct(id: number): Observable<Product> {
    return new Observable<Product>((observer) => {
      this.http
        .delete<Product>(`${this.apiUrl}/products/${id}`, {
          headers: this.getHeaders(),
        })
        .subscribe({
          next: (deletedProduct) => {
            const currentProducts = this.productsSubject.getValue();
            this.productsSubject.next(
              currentProducts.filter((p) => p.id !== id)
            );
            observer.next(deletedProduct);
            observer.complete();
          },
          error: (err) => observer.error(err),
        });
    });
  }
}
