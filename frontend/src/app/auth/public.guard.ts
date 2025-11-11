import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PublicGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const user = this.authService.getUser();

    // If user is authenticated, redirect them to their appropriate dashboard
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
        return false;
      } else if (user.role === 'customer') {
        this.router.navigate(['/user/dashboard']);
        return false;
      } else {
        // Unknown role, redirect to landing page but allow access
        return true;
      }
    }

    // If not authenticated, allow access to landing page
    return true;
  }
}