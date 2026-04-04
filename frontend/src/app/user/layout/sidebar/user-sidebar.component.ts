import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface SidebarItem {
  label: string;
  route: string;
  icon:
    | 'dashboard'
    | 'products'
    | 'orders'
    | 'messages'
    | 'customers'
    | 'settings';
  exact?: boolean;
}

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.scss'],
})
export class UserSidebarComponent {
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();

  readonly navItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      route: '/user/dashboard',
      icon: 'dashboard',
      exact: true,
    },
    { label: 'Shop / Products', route: '/user/products', icon: 'products' },
    { label: 'Orders', route: '/user/orders', icon: 'orders' },
    { label: 'Messages / Chat', route: '/user/messages', icon: 'messages' },
    { label: 'Community', route: '/user/community', icon: 'customers' },
    { label: 'Settings', route: '/user/settings', icon: 'settings' },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    const email = this.authService.getUser()?.email || '';
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  }
}
