import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminGuard } from '../auth/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      // Add more admin routes here as we create them
      // { path: 'products', component: ProductsComponent },
      // { path: 'users', component: UsersComponent },
      // { path: 'orders', component: OrdersComponent },
    ]
  }
];
