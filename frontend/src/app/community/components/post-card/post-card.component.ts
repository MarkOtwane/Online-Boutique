import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommunityPost } from '../../../interfaces/community-post';
import { AuthService } from '../../../services/auth.service';
import { CommunityService } from '../../../services/community.service';
import { CommentSectionComponent } from '../comment-section/comment-section.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, CommentSectionComponent],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css'],
})
export class PostCardComponent {
  private readonly communityService = inject(CommunityService);
  private readonly authService = inject(AuthService);

  @Input({ required: true }) post!: CommunityPost;
  @Output() removed = new EventEmitter<number>();

  liking = false;

  get currentUserId(): number | null {
    return this.authService.getUser()?.id ?? null;
  }

  get hasLiked(): boolean {
    const userId = this.currentUserId;
    if (!userId) {
      return false;
    }
    return (
      this.post.reactions?.some((reaction) => reaction.userId === userId) ??
      false
    );
  }

  toggleLike(): void {
    if (this.liking) {
      return;
    }

    this.liking = true;
    const wasLiked = this.hasLiked;
    this.post.reactionCount += wasLiked ? -1 : 1;

    const request$ = wasLiked
      ? this.communityService.unlikePost(this.post.id)
      : this.communityService.likePost(this.post.id);

    request$.subscribe({
      next: (response) => {
        if (response.reaction) {
          this.post.reactions = [
            ...(this.post.reactions || []),
            response.reaction,
          ];
        } else {
          this.post.reactions = (this.post.reactions || []).filter(
            (reaction) => reaction.userId !== this.currentUserId,
          );
        }
        this.liking = false;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        this.post.reactionCount += wasLiked ? 1 : -1;
        this.liking = false;
      },
    });
  }

  deletePost(): void {
    this.communityService.deleteCommunityPost(this.post.id).subscribe({
      next: () => this.removed.emit(this.post.id),
      error: (error) => console.error('Error deleting post:', error),
    });
  }
}
