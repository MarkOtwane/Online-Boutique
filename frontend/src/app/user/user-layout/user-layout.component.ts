import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { UserNavbarComponent } from '../layout/navbar/user-navbar.component';
import { UserSidebarComponent } from '../layout/sidebar/user-sidebar.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    UserNavbarComponent,
    UserSidebarComponent,
  ],
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss'],
})
export class UserLayoutComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);
  private readonly subscriptions = new Subscription();

  sidebarCollapsed = false;
  mobileOpen = false;
  darkMode = false;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.chatService.initializeSocketConnection();
    }
    this.darkMode = localStorage.getItem('boutique-dark-mode') === 'true';
    document.documentElement.classList.toggle('dark-mode', this.darkMode);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileSidebar(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobileSidebar(): void {
    this.mobileOpen = false;
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('boutique-dark-mode', String(this.darkMode));
    document.documentElement.classList.toggle('dark-mode', this.darkMode);
  }
}
