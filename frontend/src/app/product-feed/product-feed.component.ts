import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { Product } from '../interfaces/product';
import { Comment } from '../interfaces/comment';

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
  private pollingInterval: any;

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
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
      },
      error: (err) => {
        this.errorMessage = 'Failed to load products';
        this.isLoading = false;
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

    this.productService.createComment(this.selectedProduct.id, this.newComment).subscribe({
      next: () => {
        this.newComment = '';
        this.loadProductDetail(this.selectedProduct!.id);
      },
      error: (err) => {
        this.errorMessage = 'Failed to add comment';
      }
    });
  }

  submitReply(): void {
    if (!this.replyToCommentId || !this.newReply.trim()) return;

    this.productService.createComment(this.selectedProduct!.id, this.newReply, this.replyToCommentId).subscribe({
      next: () => {
        this.newReply = '';
        this.replyToCommentId = null;
        this.loadProductDetail(this.selectedProduct!.id);
      },
      error: (err) => {
        this.errorMessage = 'Failed to add reply';
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

    this.productService.createRepost(this.selectedProduct.id, this.newRepostContent || undefined).subscribe({
      next: () => {
        this.newRepostContent = '';
        this.loadProductDetail(this.selectedProduct!.id);
      },
      error: (err) => {
        this.errorMessage = 'Failed to repost';
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
    this.productService.deleteComment(commentId).subscribe({
      next: () => {
        this.loadProductDetail(this.selectedProduct!.id);
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete comment';
      }
    });
  }

  deleteRepost(repostId: number): void {
    this.productService.deleteRepost(repostId).subscribe({
      next: () => {
        this.loadProductDetail(this.selectedProduct!.id);
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete repost';
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentUserId(): number | null {
    return this.authService.getUser()?.id || null;
  }
}