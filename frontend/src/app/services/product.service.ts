import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../interfaces/category';
import { Product } from '../interfaces/product';

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
     // Load categories first (they're needed for product forms)
     this.http
       .get<Category[]>(`${this.apiUrl}/categories`, {
         headers: this.getHeaders(),
       })
       .subscribe({
         next: (categories) => {
           console.log('Categories loaded successfully:', categories);
           this.categoriesSubject.next(categories || []);
         },
         error: (err) => {
           console.error('Failed to load categories:', err);
           this.categoriesSubject.next([]);
         },
       });

     // Load products
     this.http
       .get<{ products: Product[]; total: number }>(`${this.apiUrl}/products`, {
         headers: this.getHeaders(),
       })
       .subscribe({
         next: (response) => {
           console.log('Products loaded successfully:', response.products);
           this.productsSubject.next(response.products || []);
         },
         error: (err) => {
           console.error('Failed to load products:', err);
           this.productsSubject.next([]);
         },
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

  getRecentProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/recent`);
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  createProduct(product: Partial<Product>, image?: File): Observable<Product> {
    const formData = new FormData();
    formData.append('name', product.name || '');
    formData.append('price', product.price?.toString() || '');
    formData.append('categoryId', product.categoryId?.toString() || '');
    if (image) {
      formData.append('image', image);
    }

    const headers = this.getHeaders();
    console.log('Creating product with token:', headers.get('Authorization') ? 'Present' : 'Missing');
    console.log('Product data:', { name: product.name, price: product.price, categoryId: product.categoryId });

    return new Observable<Product>((observer) => {
      this.http
        .post<Product>(`${this.apiUrl}/products`, formData, {
          headers: this.getHeaders(),
        })
        .subscribe({
          next: (newProduct) => {
            console.log('Product created successfully:', newProduct);
            const currentProducts = this.productsSubject.getValue();
            this.productsSubject.next([...currentProducts, newProduct]);
            observer.next(newProduct);
            observer.complete();
          },
          error: (err) => {
            console.error('Product creation error:', err);
            observer.error(err);
          },
        });
    });
  }

  updateProduct(
    id: number,
    product: Partial<Product>,
    image?: File
  ): Observable<Product> {
    const formData = new FormData();
    formData.append('name', product.name || '');
    formData.append('price', product.price?.toString() || '');
    formData.append('categoryId', product.categoryId?.toString() || '');
    if (image) {
      formData.append('image', image);
    }

    return new Observable<Product>((observer) => {
      this.http
        .put<Product>(`${this.apiUrl}/products/${id}`, formData, {
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
