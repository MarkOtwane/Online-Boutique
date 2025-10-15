import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Temporarily disable automatic user fetch to prevent initialization errors
      // this.getCurrentUser().subscribe({
      //   next: (user) => this.userSubject.next(user),
      //   error: () => localStorage.removeItem('access_token'), // Clear invalid token
      // });
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  register(
    email: string,
    password: string,
    role: string = 'customer'
  ): Observable<{ access_token: string; user: User }> {
    return this.http
      .post<{ access_token: string; user: User }>(
        `${this.apiUrl}/auth/register`,
        { email, password, role }
      )
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
          this.userSubject.next(response.user);
        })
      );
  }

  login(
    email: string,
    password: string
  ): Observable<{ access_token: string; user: User }> {
    return this.http
      .post<{ access_token: string; user: User }>(`${this.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
          this.userSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUser(): User | null {
    return this.userSubject.getValue();
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`, {
      headers: this.getHeaders(),
    });
  }
}
