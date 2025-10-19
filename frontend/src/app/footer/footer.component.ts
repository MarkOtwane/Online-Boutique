import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    // Also check current state immediately
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
