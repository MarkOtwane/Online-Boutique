import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminOrdersComponent } from './orders/orders.component';
import { AdminAnalyticsComponent } from './analytics/analytics.component';
import { AdminSettingsComponent } from './settings/settings.component';
import { AdminGuard } from '../auth/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
      { path: 'settings', component: AdminSettingsComponent },
    ]
  }
];
