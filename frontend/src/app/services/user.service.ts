import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.USERS.BASE}`, {
      headers: this.getHeaders(),
    });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`, {
      headers: this.getHeaders(),
    });
  }

  createUser(userData: { email: string; role: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.USERS.BASE}`, userData, {
      headers: this.getHeaders(),
    });
  }

  updateUser(id: number, userData: { email: string; role: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`, userData, {
      headers: this.getHeaders(),
    });
  }

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`, {
      headers: this.getHeaders(),
    });
  }
}
