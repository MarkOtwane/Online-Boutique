import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: User | null = null;
  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });

    // Also check current state immediately
    this.isLoggedIn = this.authService.isAuthenticated();
    this.currentUser = this.authService.getUser();
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
