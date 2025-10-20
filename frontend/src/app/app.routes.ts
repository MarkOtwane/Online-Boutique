import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductsComponent } from './products/products.component';
import { RegisterComponent } from './register/register.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { DashboardComponent as AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { AdminProductsComponent } from './admin/products/products.component';
import { AdminUsersComponent } from './admin/users/users.component';
import { UserDashboardComponent } from './user/dashboard/dashboard.component';
import { CartComponent } from './cart/cart.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'product/:id', component: ProductDetailComponent },
    { path: 'cart', component: CartComponent },
    { path: 'dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },
    {
      path: 'add-product',
      component: ProductFormComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'add-product/:id',
      component: ProductFormComponent,
      canActivate: [AuthGuard],
    },
        {
          path: 'admin',
          component: AdminLayoutComponent,
          canActivate: [AdminGuard],
          children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'products', component: AdminProductsComponent },
            { path: 'users', component: AdminUsersComponent },
          ]
        },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
 ];
