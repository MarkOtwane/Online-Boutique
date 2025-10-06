import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
   loginForm: FormGroup;
   successMessage: string | null = null;
   errorMessage: string | null = null;
   returnUrl: string;

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
          this.successMessage = 'Login successful! Redirecting...';
          this.errorMessage = null;
          setTimeout(() => this.router.navigate([this.returnUrl]), 2000);
        },
        error: (err) => {
          this.errorMessage = `Login failed: ${
            err.error.message || err.message
          }`;
          this.successMessage = null;
        },
      });
    } else {
      this.errorMessage = 'Please fill out the form correctly.';
      this.successMessage = null;
    }
  }
}
