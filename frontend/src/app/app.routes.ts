import { Routes } from '@angular/router';
import { AdminGuard } from './auth/admin.guard';
import { AuthGuard, CustomerGuard } from './auth/auth.guard';
import { PublicGuard } from './auth/public.guard';
import { TrackingComponent } from './tracking/tracking.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [PublicGuard],
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'feed',
    loadComponent: () =>
      import('./product-feed/product-feed.component').then(
        (m) => m.ProductFeedComponent,
      ),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent,
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./cart/cart.component').then((m) => m.CartComponent),
  },
  { path: 'community', redirectTo: '/user/community', pathMatch: 'full' },
  { path: 'tracking', component: TrackingComponent, canActivate: [AuthGuard] },
  {
    path: 'user',
    loadComponent: () =>
      import('./user/user-layout/user-layout.component').then(
        (m) => m.UserLayoutComponent,
      ),
    canActivate: [CustomerGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./user/dashboard/dashboard.component').then(
            (m) => m.UserDashboardComponent,
          ),
      },
      {
        path: 'messages',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./chat/chat.component').then((m) => m.ChatComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/products.component').then(
            (m) => m.ProductsComponent,
          ),
      },
      {
        path: 'shops',
        loadComponent: () =>
          import('./products/products.component').then(
            (m) => m.ProductsComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./user/dashboard/dashboard.component').then(
            (m) => m.UserDashboardComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./user/dashboard/dashboard.component').then(
            (m) => m.UserDashboardComponent,
          ),
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./community/community.component').then(
            (m) => m.CommunityComponent,
          ),
      },
      { path: 'customers', redirectTo: 'community', pathMatch: 'full' },
      { path: 'profile', redirectTo: 'settings', pathMatch: 'full' },
    ],
  },
  { path: 'dashboard', redirectTo: '/user/dashboard', pathMatch: 'full' },
  {
    path: 'add-product',
    loadComponent: () =>
      import('./product-form/product-form.component').then(
        (m) => m.ProductFormComponent,
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'add-product/:id',
    loadComponent: () =>
      import('./product-form/product-form.component').then(
        (m) => m.ProductFormComponent,
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./admin/products/products.component').then(
            (m) => m.AdminProductsComponent,
          ),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'products/edit/:id',
        loadComponent: () =>
          import('./product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/users/users.component').then(
            (m) => m.AdminUsersComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./admin/orders/orders.component').then(
            (m) => m.AdminOrdersComponent,
          ),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./admin/analytics/analytics.component').then(
            (m) => m.AdminAnalyticsComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin/settings/settings.component').then(
            (m) => m.AdminSettingsComponent,
          ),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
  },
];
