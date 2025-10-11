import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category';
import { Product } from '../interfaces/products';

export interface CreateProductData {
  name: string;
  price: number;
  categoryId: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/products'; // Adjust based on your backend API

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  deleteProduct(id: number): Observable<Product> {
    return this.http.delete<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(
    productData: CreateProductData,
    file?: File
  ): Observable<Product> {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('price', productData.price.toString());
    formData.append('categoryId', productData.categoryId.toString());

    if (file) {
      formData.append('image', file);
    }

    return this.http.post<Product>(this.apiUrl, formData);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  updateProduct(
    id: number,
    productData: Partial<CreateProductData>,
    file?: File
  ): Observable<Product> {
    const formData = new FormData();

    if (productData.name !== undefined) {
      formData.append('name', productData.name);
    }
    if (productData.price !== undefined) {
      formData.append('price', productData.price.toString());
    }
    if (productData.categoryId !== undefined) {
      formData.append('categoryId', productData.categoryId.toString());
    }

    if (file) {
      formData.append('image', file);
    }

    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('http://localhost:3000/categories');
  }
}
