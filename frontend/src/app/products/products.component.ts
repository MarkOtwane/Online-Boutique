import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Import the RouterLink directive

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  products = [
    { id: 1, name: 'Running Shoes', price: 59.99 },
    { id: 2, name: 'Yoga Mat', price: 19.99 },
    { id: 3, name: 'Dumbbells (Pair)', price: 39.99 },
  ];
}
