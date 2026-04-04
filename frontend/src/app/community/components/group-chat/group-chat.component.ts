import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommunityChatMessage } from '../../../interfaces/community-post';
import { AuthService } from '../../../services/auth.service';
import { CommunityChatService } from '../../../services/community-chat.service';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.css'],
})
export class GroupChatComponent implements OnInit, OnDestroy {
  private readonly chatService = inject(CommunityChatService);
  private readonly authService = inject(AuthService);
  private readonly subscriptions = new Subscription();

  @ViewChild('messagesContainer')
  messagesContainer?: ElementRef<HTMLDivElement>;

  messages: CommunityChatMessage[] = [];
  draft = '';
  loading = false;

  ngOnInit(): void {
    this.loading = true;
    this.chatService.connect();
    this.subscriptions.add(
      this.chatService.messages$.subscribe((messages) => {
        this.messages = messages;
        queueMicrotask(() => this.scrollToBottom());
      }),
    );

    this.chatService.loadMessages().subscribe({
      next: (messages) => {
        this.chatService.setMessages(messages);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading community chat:', error);
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chatService.disconnect();
  }

  send(): void {
    if (!this.draft.trim()) {
      return;
    }

    this.chatService.sendMessage(this.draft.trim());
    this.draft = '';
  }

  scrollToBottom(): void {
    const element = this.messagesContainer?.nativeElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  get userLabel(): string {
    return this.authService.getUser()?.email || 'You';
  }
}
