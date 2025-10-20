import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  sidebarCollapsed = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}
