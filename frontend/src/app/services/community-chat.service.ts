import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api.config';
import { CommunityChatMessage } from '../interfaces/community-post';

@Injectable({
  providedIn: 'root',
})
export class CommunityChatService {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/community`;
  private socket: Socket | null = null;
  private messagesSubject = new BehaviorSubject<CommunityChatMessage[]>([]);

  messages$ = this.messagesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  loadMessages(): Observable<CommunityChatMessage[]> {
    return this.http.get<CommunityChatMessage[]>(
      `${this.apiUrl}/chat/messages`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  connect(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(API_CONFIG.BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    this.socket.on(
      'receiveCommunityMessage',
      (message: CommunityChatMessage) => {
        this.messagesSubject.next([
          ...this.messagesSubject.getValue(),
          message,
        ]);
      },
    );
  }

  sendMessage(message: string): void {
    if (!this.socket) {
      return;
    }

    this.socket.emit('sendCommunityMessage', { message });
  }

  setMessages(messages: CommunityChatMessage[]): void {
    this.messagesSubject.next(messages.slice().reverse());
  }

  disconnect(): void {
    this.socket?.disconnect();
  }
}
