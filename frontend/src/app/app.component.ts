import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { User } from './interfaces/user.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'frontend';
  isAuthenticated: boolean;

  constructor(public authService: AuthService) {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.authService.user$.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

  get currentUser(): User | null {
    return this.authService.getUser();
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
  }
}
