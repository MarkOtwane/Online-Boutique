import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces/user.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        this.errorMessage = `Failed to load user data: ${err.message}`;
        this.authService.logout(); // Clear invalid token
      },
    });
  }
}
