import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommunityComment } from '../../../interfaces/community-post';
import { CommunityService } from '../../../services/community.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.css'],
})
export class CommentSectionComponent implements OnChanges {
  private readonly communityService = inject(CommunityService);
  private readonly authService = inject(AuthService);

  @Input({ required: true }) postId!: number;

  comments: CommunityComment[] = [];
  loading = false;
  expanded = false;
  newComment = '';
  replyingTo: number | null = null;
  replyContent = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postId'] && this.postId) {
      this.loadComments();
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  toggle(): void {
    this.expanded = !this.expanded;
    if (this.expanded && this.comments.length === 0) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.loading = true;
    this.communityService.getCommunityPostComments(this.postId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.loading = false;
      },
    });
  }

  addComment(parentId?: number): void {
    const content = parentId
      ? this.replyContent.trim()
      : this.newComment.trim();
    if (!content) {
      return;
    }

    this.communityService
      .addComment(this.postId, { content, parentId })
      .subscribe({
        next: () => {
          this.newComment = '';
          this.replyContent = '';
          this.replyingTo = null;
          this.loadComments();
        },
        error: (error) => {
          console.error('Error creating comment:', error);
        },
      });
  }

  startReply(commentId: number): void {
    this.replyingTo = this.replyingTo === commentId ? null : commentId;
    this.replyContent = '';
  }

  deleteComment(commentId: number): void {
    this.communityService.deleteComment(commentId).subscribe({
      next: () => this.loadComments(),
      error: (error) => console.error('Error deleting comment:', error),
    });
  }

  get totalComments(): number {
    return this.comments.reduce(
      (total, comment) => total + 1 + (comment.replies?.length || 0),
      0,
    );
  }
}
