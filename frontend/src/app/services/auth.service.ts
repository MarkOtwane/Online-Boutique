import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = API_CONFIG.BASE_URL;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Try to load user from localStorage first for immediate availability
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userSubject.next(user);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('user');
      }
    }

    // Then fetch fresh user data from server
    const token = localStorage.getItem('access_token');
    if (token) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        },
        error: () => {
          // Clear invalid token and user data
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          this.userSubject.next(null);
        }
      });
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
        `${this.apiUrl}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
        { email, password, role }
      )
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.userSubject.next(response.user);
        })
      );
  }

  login(
    email: string,
    password: string
  ): Observable<{ access_token: string; user: User }> {
    return this.http
      .post<{ access_token: string; user: User }>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.userSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUser(): User | null {
    // First try to get from BehaviorSubject
    let user = this.userSubject.getValue();
    
    // If not available, try to get from localStorage as fallback
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
          this.userSubject.next(user); // Update the subject
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          localStorage.removeItem('user');
        }
      }
    }
    
    return user;
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.USERS.ME}`, {
      headers: this.getHeaders(),
    });
  }
}
