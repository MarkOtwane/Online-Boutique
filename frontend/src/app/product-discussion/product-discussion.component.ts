import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../services/comment.service';
import { AuthService } from '../services/auth.service';
import { Comment, CreateCommentRequest } from '../interfaces/comment';
import { User } from '../interfaces/user';

@Component({
  selector: 'app-product-discussion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-discussion.component.html',
  styleUrls: ['./product-discussion.component.css'],
})
export class ProductDiscussionComponent implements OnInit {
  @Input() productId!: number;
  
  comments: Comment[] = [];
  loading = false;
  submitting = false;
  newComment = '';
  replyToComment: Comment | null = null;
  replyContent = '';
  currentUser: User | null = null;
  showReplyForm = false;

  constructor(
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    this.commentService.getProductComments(this.productId).subscribe({
      next: (comments) => {
        this.comments = this.organizeComments(comments);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.loading = false;
      },
    });
  }

  organizeComments(comments: Comment[]): Comment[] {
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize hierarchy
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }

  submitComment(): void {
    if (!this.newComment.trim() || this.submitting) return;

    this.submitting = true;
    const commentData: CreateCommentRequest = {
      productId: this.productId,
      content: this.newComment.trim(),
    };

    this.commentService.createComment(commentData).subscribe({
      next: (newComment) => {
        this.newComment = '';
        this.loadComments(); // Reload to get the new comment
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error creating comment:', error);
        this.submitting = false;
      },
    });
  }

  startReply(comment: Comment): void {
    this.replyToComment = comment;
    this.replyContent = '';
    this.showReplyForm = true;
  }

  submitReply(): void {
    if (!this.replyContent.trim() || !this.replyToComment || this.submitting) return;

    this.submitting = true;
    this.commentService.replyToComment(
      this.replyToComment.id,
      this.replyContent.trim(),
      this.productId
    ).subscribe({
      next: () => {
        this.replyContent = '';
        this.replyToComment = null;
        this.showReplyForm = false;
        this.loadComments(); // Reload to get the new reply
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error creating reply:', error);
        this.submitting = false;
      },
    });
  }

  cancelReply(): void {
    this.replyToComment = null;
    this.replyContent = '';
    this.showReplyForm = false;
  }

  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.loadComments(); // Reload comments
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
        },
      });
    }
  }

  canDeleteComment(comment: Comment): boolean {
    return !!(this.currentUser && (
      this.currentUser.id === comment.userId ||
      this.currentUser.role === 'admin'
    ));
  }

  canMarkAsAdminResponse(comment: Comment): boolean {
    return !!(this.currentUser && this.currentUser.role === 'admin' && !comment.isAdminResponse);
  }

  markAsAdminResponse(commentId: number): void {
    if (!this.currentUser || this.currentUser.role !== 'admin') return;

    this.commentService.markAsAdminResponse(commentId).subscribe({
      next: () => {
        this.loadComments(); // Reload comments to show updated status
      },
      error: (error) => {
        console.error('Error marking comment as admin response:', error);
      },
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getCommentCount(): number {
    const countReplies = (comments: Comment[]): number => {
      return comments.reduce((total, comment) => {
        return total + 1 + (comment.replies ? countReplies(comment.replies) : 0);
      }, 0);
    };
    return countReplies(this.comments);
  }
}
