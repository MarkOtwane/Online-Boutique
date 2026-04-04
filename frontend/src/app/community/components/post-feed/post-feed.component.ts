import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CommunityPost } from '../../../interfaces/community-post';
import { CommunityService } from '../../../services/community.service';
import { CreatePostComponent } from '../create-post/create-post.component';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-post-feed',
  standalone: true,
  imports: [CommonModule, CreatePostComponent, PostCardComponent],
  templateUrl: './post-feed.component.html',
  styleUrls: ['./post-feed.component.css'],
})
export class PostFeedComponent implements OnInit {
  private readonly communityService = inject(CommunityService);

  posts: CommunityPost[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.communityService.getCommunityPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading community feed:', error);
        this.loading = false;
      },
    });
  }

  removePost(postId: number): void {
    this.posts = this.posts.filter((post) => post.id !== postId);
  }
}
