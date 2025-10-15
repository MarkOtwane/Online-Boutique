import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/products';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: () => {
          console.log('Login successful! Return URL:', this.returnUrl);
          console.log('Current URL:', this.router.url);
          this.successMessage = 'Login successful! Redirecting...';
          this.errorMessage = null;

          // Navigate immediately instead of waiting
          const targetUrl = this.returnUrl || '/products';
          console.log('Attempting navigation to:', targetUrl);

          this.router.navigate([targetUrl]).then((result) => {
            console.log('Navigation result:', result);
            if (!result) {
              console.error('Navigation failed, trying fallback');
              this.router.navigate(['/products']);
            }
          }).catch((error) => {
            console.error('Navigation error:', error);
            // Fallback navigation
            this.router.navigate(['/products']);
          });
        },
        error: (err) => {
          // Debug: Log the full error object to understand its structure
          console.log('Full error object:', err);
          console.log('Error error property:', err.error);
          console.log('Error message property:', err.message);
          console.log('Error status:', err.status);

          let errorMsg = 'Login failed';

          // Handle different error response structures
          if (err.error) {
            if (typeof err.error === 'string') {
              errorMsg = err.error;
            } else if (err.error.message) {
              errorMsg = err.error.message;
            } else if (typeof err.error === 'object') {
              // Try to extract any meaningful error information from the object
              const errorKeys = Object.keys(err.error);
              if (errorKeys.length > 0) {
                const firstError = err.error[errorKeys[0]];
                errorMsg = typeof firstError === 'string' ? firstError : 'Invalid credentials';
              } else {
                errorMsg = 'Invalid credentials';
              }
            }
          } else if (err.message) {
            errorMsg = err.message;
          } else if (err.status) {
            switch (err.status) {
              case 401:
                errorMsg = 'Invalid email or password';
                break;
              case 404:
                errorMsg = 'Login service not found';
                break;
              case 500:
                errorMsg = 'Server error. Please try again later';
                break;
              default:
                errorMsg = `Login failed (${err.status})`;
            }
          }

          console.log('Final error message:', errorMsg);
          this.errorMessage = errorMsg;
          this.successMessage = null;
        },
      });
    } else {
      this.errorMessage = 'Please fill out the form correctly.';
      this.successMessage = null;
    }
  }
}
