import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { CommentService } from '../services/comment.service';
import { RepostService } from '../services/repost.service';
import { ReactionService } from '../services/reaction.service';
import { Product } from '../interfaces/product';
import { Comment } from '../interfaces/comment';
import { Repost } from '../interfaces/repost';

@Component({
  selector: 'app-product-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-feed.component.html',
  styleUrls: ['./product-feed.component.css']
})
export class ProductFeedComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  selectedProduct: Product | null = null;
  newComment = '';
  newReply = '';
  replyToCommentId: number | null = null;
  newRepostContent = '';
  isLoading = false;
  errorMessage = '';
  userReactions: Map<number, boolean> = new Map();
  private pollingInterval: any;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private commentService: CommentService,
    private repostService: RepostService,
    private reactionService: ReactionService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadUserReactions();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.loadProducts();
    }, 30000); // Poll every 30 seconds
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
        this.loadUserReactions();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load products';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  openProductDetail(product: Product): void {
    this.selectedProduct = product;
  }

  closeProductDetail(): void {
    this.selectedProduct = null;
    this.newComment = '';
    this.newReply = '';
    this.replyToCommentId = null;
    this.newRepostContent = '';
  }

  submitComment(): void {
    if (!this.selectedProduct || !this.newComment.trim()) return;

    this.commentService.createComment({
      productId: this.selectedProduct.id,
      content: this.newComment.trim()
    }).subscribe({
      next: () => {
        this.newComment = '';
        this.loadProductDetail(this.selectedProduct!.id);
      },
      error: (err) => {
        this.errorMessage = 'Failed to add comment';
        console.error(err);
      }
    });
  }

  submitReply(): void {
    if (!this.replyToCommentId || !this.newReply.trim() || !this.selectedProduct) return;

    this.commentService.createComment({
      productId: this.selectedProduct.id,
      content: this.newReply.trim(),
      parentId: this.replyToCommentId
    }).subscribe({
      next: () => {
        this.newReply = '';
        this.replyToCommentId = null;
        this.loadProductDetail(this.selectedProduct!.id);
      },
      error: (err) => {
        this.errorMessage = 'Failed to add reply';
        console.error(err);
      }
    });
  }

  startReply(commentId: number): void {
    this.replyToCommentId = commentId;
    this.newReply = '';
  }

  cancelReply(): void {
    this.replyToCommentId = null;
    this.newReply = '';
  }

  submitRepost(): void {
    if (!this.selectedProduct) return;

    this.repostService.createRepost(
      this.selectedProduct.id,
      this.newRepostContent.trim() || undefined
    ).subscribe({
      next: () => {
        this.newRepostContent = '';
        this.loadProductDetail(this.selectedProduct!.id);
      },
      error: (err) => {
        this.errorMessage = 'Failed to repost';
        console.error(err);
      }
    });
  }

  loadProductDetail(productId: number): void {
    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        if (this.selectedProduct) {
          this.selectedProduct = product;
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load product details';
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.loadProductDetail(this.selectedProduct!.id);
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete comment';
        console.error(err);
      }
    });
  }

  deleteRepost(repostId: number): void {
    if (!confirm('Are you sure you want to delete this repost?')) return;

    this.repostService.deleteRepost(repostId).subscribe({
      next: () => {
        this.loadProductDetail(this.selectedProduct!.id);
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete repost';
        console.error(err);
      }
    });
  }

  toggleReaction(productId: number): void {
    if (!this.isAuthenticated()) {
      this.errorMessage = 'Please login to react';
      return;
    }

    this.reactionService.toggleReaction(productId).subscribe({
      next: (response) => {
        this.userReactions.set(productId, response.action === 'added');
        this.loadProductDetail(productId);
      },
      error: (err) => {
        this.errorMessage = 'Failed to toggle reaction';
        console.error(err);
      }
    });
  }

  hasUserReacted(productId: number): boolean {
    return this.userReactions.get(productId) || false;
  }

  loadUserReactions(): void {
    if (!this.isAuthenticated()) return;

    this.products.forEach(product => {
      this.reactionService.getUserReaction(product.id).subscribe({
        next: (reaction) => {
          this.userReactions.set(product.id, !!reaction);
        },
        error: () => {
          this.userReactions.set(product.id, false);
        }
      });
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentUserId(): number | null {
    return this.authService.getUser()?.id || null;
  }
}