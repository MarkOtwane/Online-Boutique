import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-navbar.component.html',
  styleUrls: ['./user-navbar.component.scss'],
})
export class UserNavbarComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);
  private readonly router = inject(Router);

  @Output() searchSubmitted = new EventEmitter<string>();

  searchTerm = '';
  notificationCount = 0;
  dropdownOpen = false;
  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.chatService.conversations$.subscribe((conversations) => {
        this.notificationCount = conversations.reduce(
          (total, conversation) => total + (conversation.unreadCount || 0),
          0,
        );
      }),
    );
  }

  getUserEmail(): string {
    return this.authService.getUser()?.email || 'Guest';
  }

  getUserInitials(): string {
    const email = this.authService.getUser()?.email || 'U';
    return email.charAt(0).toUpperCase();
  }

  submitSearch(): void {
    const query = this.searchTerm.trim();
    if (!query) {
      return;
    }

    this.searchSubmitted.emit(query);
    this.router.navigate(['/products'], { queryParams: { q: query } });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
