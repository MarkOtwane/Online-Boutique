import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    const user = this.authService.getUser();
    
    // If user is already loaded, check immediately
    if (user) {
      if (user.role === 'admin') {
        return true;
      } else if (user.role === 'customer') {
        this.router.navigate(['/dashboard']);
        return false;
      } else {
        this.router.navigate(['/']);
        return false;
      }
    }

    // If user is not loaded yet, wait for it
    return this.authService.getCurrentUser().pipe(
      map((user) => {
        if (user.role === 'admin') {
          return true;
        } else if (user.role === 'customer') {
          this.router.navigate(['/dashboard']);
          return false;
        } else {
          this.router.navigate(['/']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url },
        });
        return of(false);
      })
    );
  }
}