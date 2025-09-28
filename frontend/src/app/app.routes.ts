import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductsComponent } from './products/products.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'add-product', component: ProductFormComponent },
  { path: 'add-product/:id', component: ProductFormComponent },
];
