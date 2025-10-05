import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './products/products';

export interface CreateProductData {
  name: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/products'; // Adjust based on your backend API

  constructor(private http: HttpClient) { }

  createProduct(productData: CreateProductData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData);
  }
}
