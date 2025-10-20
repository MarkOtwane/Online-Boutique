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
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getUser();
      if (user && user.role === 'admin') {
        return true; // Allow access if authenticated and is admin
      } else {
        this.router.navigate(['/']);
        return false; // Redirect to home if not admin
      }
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false; // Redirect to login if not authenticated
    }
  }
}