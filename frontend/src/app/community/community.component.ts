import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommentService } from '../services/comment.service';
import { ProductService } from '../services/product.service';
import { CommunityService } from '../services/community.service';
import { AuthService } from '../services/auth.service';
import { Comment } from '../interfaces/comment';
import { Product } from '../interfaces/product';
import { User } from '../interfaces/user';
import { CommunityPost } from '../interfaces/community-post';

interface DiscussionWithProduct extends Comment {
  product: Product;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css'],
})
export class CommunityComponent implements OnInit {
  // Product discussions
  discussions: DiscussionWithProduct[] = [];
  products: Product[] = [];
  
  // Community posts
  communityPosts: CommunityPost[] = [];
  
  // General state
  loading = false;
  selectedProductId = '';
  searchQuery = '';
  currentUser: User | null = null;
  activeTab: 'discussions' | 'community' = 'community'; // Default to community posts
  postTypeFilter = '';
  newPostContent = '';
  newPostCaption = '';
  newPostImageUrl = '';
  showNewPostForm = false;

  constructor(
    private commentService: CommentService,
    private productService: ProductService,
    private communityService: CommunityService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.currentUser = user;
    });
    this.loadProducts();
    this.loadCommunityPosts(); // Load community posts by default
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
  }

  // Community Posts Methods
  loadCommunityPosts(): void {
    this.loading = true;
    const filters: any = {};
    if (this.postTypeFilter) {
      filters.postType = this.postTypeFilter;
    }
    
    this.communityService.getCommunityPosts(filters).subscribe({
      next: (posts) => {
        this.communityPosts = posts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading community posts:', error);
        this.loading = false;
      },
    });
  }

  createCommunityPost(): void {
    if (!this.newPostContent.trim() || !this.newPostCaption.trim()) {
      return;
    }

    const postData = {
      content: this.newPostContent,
      caption: this.newPostCaption,
      imageUrl: this.newPostImageUrl || undefined,
      postType: this.currentUser?.role === 'admin' ? 'ADMIN_ANNOUNCEMENT' : 'GENERAL',
    };

    this.communityService.createCommunityPost(postData).subscribe({
      next: (post) => {
        this.communityPosts.unshift(post);
        this.resetNewPostForm();
        this.showNewPostForm = false;
      },
      error: (error) => {
        console.error('Error creating community post:', error);
      },
    });
  }

  toggleReaction(postId: number): void {
    this.communityService.toggleReaction(postId).subscribe({
      next: (response) => {
        // Update the local post with new reaction count
        const postIndex = this.communityPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          this.communityPosts[postIndex].reactionCount = response.reaction
            ? this.communityPosts[postIndex].reactionCount + 1
            : this.communityPosts[postIndex].reactionCount - 1;
        }
      },
      error: (error) => {
        console.error('Error toggling reaction:', error);
      },
    });
  }

  repost(postId: number): void {
    const content = prompt('Add a comment for your repost (optional):');
    this.communityService.repost(postId, content || undefined).subscribe({
      next: () => {
        // Update repost count
        const postIndex = this.communityPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          this.communityPosts[postIndex].repostCount += 1;
        }
        alert('Post reposted successfully!');
      },
      error: (error) => {
        console.error('Error reposting:', error);
      },
    });
  }

  deletePost(postId: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.communityService.deleteCommunityPost(postId).subscribe({
        next: () => {
          this.communityPosts = this.communityPosts.filter(p => p.id !== postId);
        },
        error: (error) => {
          console.error('Error deleting post:', error);
        },
      });
    }
  }

  // Product Discussions Methods (existing functionality)
  loadAllDiscussions(): void {
    this.loading = true;
    this.commentService.getAllDiscussions().subscribe({
      next: (discussions) => {
        this.discussions = discussions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading discussions:', error);
        this.loading = false;
      },
    });
  }

  loadDiscussionsByProduct(): void {
    if (!this.selectedProductId) {
      this.loadAllDiscussions();
      return;
    }

    this.loading = true;
    this.commentService.getProductComments(parseInt(this.selectedProductId)).subscribe({
      next: (discussions) => {
        this.productService.getProduct(parseInt(this.selectedProductId)).subscribe({
          next: (product) => {
            this.discussions = discussions.map(discussion => ({
              ...discussion,
              product,
            }));
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading product:', error);
            this.loading = false;
          },
        });
      },
      error: (error) => {
        console.error('Error loading discussions:', error);
        this.loading = false;
      },
    });
  }

  searchDiscussions(): void {
    if (!this.searchQuery.trim()) {
      this.loadAllDiscussions();
      return;
    }

    this.loading = true;
    this.commentService.searchDiscussions(this.searchQuery).subscribe({
      next: (discussions) => {
        this.discussions = discussions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching discussions:', error);
        this.loading = false;
      },
    });
  }

  // Utility Methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTotalReplies(discussion: Comment): number {
    const countReplies = (comments: Comment[]): number => {
      return comments.reduce((total, comment) => {
        return total + (comment.replies ? countReplies(comment.replies) : 0);
      }, 0);
    };
    return discussion.replies ? countReplies(discussion.replies) : 0;
  }

  canAccessAdminFeatures(): boolean {
    return this.currentUser?.role === 'admin';
  }

  canCreatePosts(): boolean {
    return !!this.currentUser;
  }

  resetNewPostForm(): void {
    this.newPostContent = '';
    this.newPostCaption = '';
    this.newPostImageUrl = '';
  }

  // Event Handlers
  onTabChange(tab: 'discussions' | 'community'): void {
    this.activeTab = tab;
    this.searchQuery = '';
    this.selectedProductId = '';
    this.postTypeFilter = '';
    
    if (tab === 'community') {
      this.loadCommunityPosts();
    } else {
      this.loadAllDiscussions();
    }
  }

  onProductFilterChange(): void {
    this.loadDiscussionsByProduct();
  }

  onPostTypeFilterChange(): void {
    this.loadCommunityPosts();
  }

  onSearchChange(): void {
    if (this.activeTab === 'discussions') {
      if (this.searchQuery.trim() === '') {
        this.loadAllDiscussions();
      }
    }
    // Community posts search can be implemented later
  }
}