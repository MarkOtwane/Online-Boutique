import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review, ReviewStatistics, CreateReviewDto, UpdateReviewDto } from '../services/review.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-reviews">
      <!-- Review Statistics -->
      <div class="review-statistics" *ngIf="statistics">
        <div class="rating-overview">
          <div class="average-rating">
            <span class="rating-number">{{ statistics.averageRating | number:'1.1-1' }}</span>
            <div class="stars">
              <i class="fas fa-star" *ngFor="let star of [1,2,3,4,5]" 
                 [class.filled]="star <= statistics.averageRating"></i>
            </div>
            <span class="review-count">({{ statistics.totalReviews }} reviews)</span>
          </div>
        </div>
        
        <div class="rating-distribution">
          <div class="rating-bar" *ngFor="let rating of [5,4,3,2,1]">
            <span class="rating-label">{{ rating }} star</span>
            <div class="bar-container">
              <div class="bar" 
                   [style.width.%]="getRatingPercentage(rating)"
                   [style.backgroundColor]="getRatingColor(rating)">
              </div>
            </div>
            <span class="rating-count">{{ (statistics.distribution)[rating] || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Create Review Form -->
      <div class="create-review" *ngIf="canUserReview && canUserReview.canReview">
        <h3>Write a Review</h3>
        <form (ngSubmit)="submitReview()" #reviewForm="ngForm">
          <div class="form-group">
            <label>Rating *</label>
            <div class="star-rating">
              <button type="button" 
                      *ngFor="let star of [1,2,3,4,5]"
                      class="star-btn"
                      [class.filled]="newReview.rating >= star"
                      (click)="newReview.rating = star">
                <i class="fas fa-star"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="reviewTitle">Title (Optional)</label>
            <input type="text" 
                   id="reviewTitle"
                   class="form-control"
                   [(ngModel)]="newReview.title"
                   name="title"
                   placeholder="Summarize your experience">
          </div>

          <div class="form-group">
            <label for="reviewContent">Review *</label>
            <textarea id="reviewContent"
                      class="form-control"
                      [(ngModel)]="newReview.content"
                      name="content"
                      rows="4"
                      placeholder="Share your detailed experience with this product..."
                      required></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" 
                    class="btn btn-primary"
                    [disabled]="!reviewForm.valid || isSubmitting">
              <span *ngIf="!isSubmitting">Submit Review</span>
              <span *ngIf="isSubmitting">
                <i class="fas fa-spinner fa-spin"></i> Submitting...
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Review List -->
      <div class="review-list">
        <div class="review-filters">
          <select [(ngModel)]="selectedRatingFilter" (change)="loadReviews()">
            <option value="">All Ratings</option>
            <option *ngFor="let rating of [5,4,3,2,1]" [value]="rating">
              {{ rating }} Star{{ rating !== 1 ? 's' : '' }}
            </option>
          </select>
          
          <select [(ngModel)]="sortBy" (change)="loadReviews()">
            <option value="createdAt">Most Recent</option>
            <option value="rating">Highest Rated</option>
            <option value="helpfulCount">Most Helpful</option>
          </select>
        </div>

        <div class="reviews-container" *ngIf="reviews && reviews.length > 0">
          <div class="review-item" *ngFor="let review of reviews">
            <div class="review-header">
              <div class="user-info">
                <span class="user-name">{{ review.user.email.split('@')[0] }}</span>
                <span class="verified-badge" *ngIf="review.verifiedPurchase">
                  <i class="fas fa-check-circle"></i> Verified Purchase
                </span>
              </div>
              <div class="review-rating">
                <div class="stars">
                  <i class="fas fa-star" *ngFor="let star of [1,2,3,4,5]" 
                     [class.filled]="star <= review.rating"></i>
                </div>
                <span class="rating-date">{{ review.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>

            <div class="review-content" *ngIf="review.title">
              <h4 class="review-title">{{ review.title }}</h4>
            </div>

            <p class="review-text">{{ review.content }}</p>

            <div class="review-images" *ngIf="review.reviewImages && review.reviewImages.length > 0">
              <img *ngFor="let image of review.reviewImages" 
                   [src]="image" 
                   alt="Review image" 
                   class="review-image"
                   (click)="openImageModal(image)">
            </div>

            <div class="review-actions">
              <div class="helpful-section">
                <span>Was this helpful?</span>
                <button class="helpful-btn" 
                        [class.active]="userMarkedHelpful === true"
                        (click)="markHelpful(review.id, true)"
                        [disabled]="isMarkingHelpful">
                  <i class="fas fa-thumbs-up"></i> 
                  <span>{{ review.helpfulCount }}</span>
                </button>
                <button class="helpful-btn" 
                        [class.active]="userMarkedHelpful === false"
                        (click)="markHelpful(review.id, false)"
                        [disabled]="isMarkingHelpful">
                  <i class="fas fa-thumbs-down"></i>
                  <span>{{ review.notHelpfulCount }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="no-reviews" *ngIf="!reviews || reviews.length === 0">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>

        <!-- Load More -->
        <div class="load-more" *ngIf="hasMoreReviews">
          <button class="btn btn-outline" (click)="loadMoreReviews()">
            Load More Reviews
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-reviews.component.css']
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: number;
  @Output() reviewSubmitted = new EventEmitter<Review>();

  reviews: Review[] = [];
  statistics: ReviewStatistics | null = null;
  canUserReview: any = null;
  userMarkedHelpful: boolean | null = null;
  
  newReview: CreateReviewDto = {
    productId: 0,
    content: '',
    rating: 0,
    title: ''
  };

  selectedRatingFilter = '';
  sortBy = 'createdAt';
  currentPage = 1;
  hasMoreReviews = false;
  isLoading = false;
  isSubmitting = false;
  isMarkingHelpful = false;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.productId) {
      this.newReview.productId = this.productId;
      this.loadStatistics();
      this.loadReviews();
      this.checkUserReviewStatus();
    }
  }

  loadStatistics() {
    this.reviewService.getReviewStatistics(this.productId).subscribe({
      next: (stats) => this.statistics = stats,
      error: (error) => console.error('Error loading statistics:', error)
    });
  }

  loadReviews(loadMore = false) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    if (!loadMore) {
      this.currentPage = 1;
      this.reviews = [];
    }

    const params: any = {
      productId: this.productId,
      page: this.currentPage,
      limit: 10,
      sortBy: this.sortBy
    };

    if (this.selectedRatingFilter) {
      params.ratingFilter = Number(this.selectedRatingFilter);
    }

    this.reviewService.getReviews(params).subscribe({
      next: (response) => {
        if (loadMore) {
          this.reviews.push(...response.reviews);
        } else {
          this.reviews = response.reviews;
        }
        this.hasMoreReviews = response.pagination.page < response.pagination.pages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      }
    });
  }

  loadMoreReviews() {
    this.currentPage++;
    this.loadReviews(true);
  }

  checkUserReviewStatus() {
    if (this.authService.isAuthenticated()) {
      this.reviewService.canUserReview(this.productId).subscribe({
        next: (result) => this.canUserReview = result,
        error: (error) => console.error('Error checking review status:', error)
      });
    }
  }

  submitReview() {
    if (!this.authService.isAuthenticated()) {
      alert('Please log in to submit a review');
      return;
    }

    if (!this.newReview.content || this.newReview.rating === 0) {
      return;
    }

    this.isSubmitting = true;
    this.reviewService.createReview(this.newReview).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.reviewSubmitted.emit(review);
        this.resetForm();
        this.isSubmitting = false;
        this.checkUserReviewStatus();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        alert('Error submitting review. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  resetForm() {
    this.newReview = {
      productId: this.productId,
      content: '',
      rating: 0,
      title: ''
    };
  }

  markHelpful(reviewId: number, isHelpful: boolean) {
    if (!this.authService.isAuthenticated()) {
      alert('Please log in to mark reviews as helpful');
      return;
    }

    this.isMarkingHelpful = true;
    this.reviewService.markHelpful(reviewId, isHelpful).subscribe({
      next: () => {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
          if (isHelpful) {
            review.helpfulCount++;
            if (this.userMarkedHelpful === false) {
              review.notHelpfulCount--;
            }
          } else {
            review.notHelpfulCount++;
            if (this.userMarkedHelpful === true) {
              review.helpfulCount--;
            }
          }
          this.userMarkedHelpful = isHelpful;
        }
        this.isMarkingHelpful = false;
      },
      error: (error) => {
        console.error('Error marking helpful:', error);
        this.isMarkingHelpful = false;
      }
    });
  }

  getRatingPercentage(rating: number): number {
    if (!this.statistics) return 0;
    const distribution = this.statistics.distribution as any;
    return (distribution[rating] / this.statistics.totalReviews) * 100;
  }

  getRatingColor(rating: number): string {
    const colors = {
      5: '#10B981',
      4: '#3B82F6', 
      3: '#F59E0B',
      2: '#F97316',
      1: '#EF4444'
    };
    return colors[rating as keyof typeof colors] || '#6B7280';
  }

  openImageModal(image: string) {
    // This would open an image modal - for now just open in new tab
    window.open(image, '_blank');
  }
}