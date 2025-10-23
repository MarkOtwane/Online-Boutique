import { Routes } from '@angular/router';
import { AuthGuard, CustomerGuard } from './auth/auth.guard';
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
import { AdminOrdersComponent } from './admin/orders/orders.component';
import { AdminAnalyticsComponent } from './admin/analytics/analytics.component';
import { AdminSettingsComponent } from './admin/settings/settings.component';
import { UserLayoutComponent } from './user/user-layout/user-layout.component';
import { UserDashboardComponent } from './user/dashboard/dashboard.component';
import { CartComponent } from './cart/cart.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ChatComponent } from './chat/chat.component';
import { CommunityComponent } from './community/community.component';
import { ProductFeedComponent } from './product-feed/product-feed.component';

export const routes: Routes = [
       { path: '', component: HomeComponent },
       { path: 'products', component: ProductsComponent },
       { path: 'feed', component: ProductFeedComponent },
       { path: 'product/:id', component: ProductDetailComponent },
       { path: 'cart', component: CartComponent },
       { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
       { path: 'community', component: CommunityComponent },
      {
        path: 'user',
        component: UserLayoutComponent,
        canActivate: [CustomerGuard],
        children: [
          { path: 'dashboard', component: UserDashboardComponent },
          { path: 'profile', component: UserDashboardComponent }, // Using dashboard as profile for now
          { path: 'orders', component: UserDashboardComponent }, // Using dashboard for orders for now
        ]
      },
      { path: 'dashboard', redirectTo: '/user/dashboard', pathMatch: 'full' },
    {
      path: 'add-product',
      component: ProductFormComponent,
      canActivate: [AdminGuard],
    },
    {
      path: 'add-product/:id',
      component: ProductFormComponent,
      canActivate: [AdminGuard],
    },
        {
          path: 'admin',
          component: AdminLayoutComponent,
          canActivate: [AdminGuard],
          children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'products', component: AdminProductsComponent },
            { path: 'products/new', component: ProductFormComponent },
            { path: 'products/edit/:id', component: ProductFormComponent },
            { path: 'users', component: AdminUsersComponent },
            { path: 'orders', component: AdminOrdersComponent },
            { path: 'analytics', component: AdminAnalyticsComponent },
            { path: 'settings', component: AdminSettingsComponent },
          ]
        },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
 ];
