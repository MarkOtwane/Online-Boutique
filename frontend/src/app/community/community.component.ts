import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommentService } from '../services/comment.service';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { Comment } from '../interfaces/comment';
import { Product } from '../interfaces/product';
import { User } from '../interfaces/user';

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
  discussions: DiscussionWithProduct[] = [];
  products: Product[] = [];
  loading = false;
  selectedProductId = '';
  searchQuery = '';
  currentUser: User | null = null;

  constructor(
    private commentService: CommentService,
    private productService: ProductService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.currentUser = user;
    });
    this.loadProducts();
    this.loadAllDiscussions();
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
        // Add product information to discussions
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

  onProductFilterChange(): void {
    this.loadDiscussionsByProduct();
  }

  onSearchChange(): void {
    if (this.searchQuery.trim() === '') {
      this.loadAllDiscussions();
    }
  }
}