import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductsComponent } from './products/products.component';
import { RegisterComponent } from './register/register.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const routes: Routes = [
   { path: '', component: HomeComponent },
   { path: 'products', component: ProductsComponent },
   { path: 'cart', component: CartComponent },
   { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
   { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
   { path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard] },
   {
     path: 'admin',
     component: AdminLayoutComponent,
     canActivate: [AuthGuard, AdminGuard],
     children: [
       { path: '', component: AdminDashboardComponent },
       {
         path: 'add-product',
         component: ProductFormComponent,
       },
       {
         path: 'add-product/:id',
         component: ProductFormComponent,
       },
     ]
   },
   { path: 'login', component: LoginComponent },
   { path: 'register', component: RegisterComponent },
 ];
