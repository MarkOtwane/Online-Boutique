import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecommendationService, ProductRecommendation } from '../services/recommendation.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-product-recommendations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="recommendations-widget">
      <div class="widget-header">
        <h3>{{ title }}</h3>
        <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>

      <div class="recommendations-loading" *ngIf="isLoading">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading recommendations...</span>
        </div>
      </div>

      <div class="recommendations-error" *ngIf="error && !isLoading">
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" (click)="loadRecommendations()">Try Again</button>
      </div>

      <div class="recommendations-container" *ngIf="recommendations && recommendations.length > 0 && !isLoading">
        <div class="recommendation-item" 
             *ngFor="let recommendation of recommendations; trackBy: trackByRecommendationId"
             (click)="onRecommendationClick(recommendation)">
          
          <div class="recommendation-badge">
            <span class="badge" [class]="'badge-' + recommendation.recommendationType">
              {{ getRecommendationTypeLabel(recommendation.recommendationType) }}
            </span>
            <span class="score">{{ (recommendation.score * 100).toFixed(0) }}% match</span>
          </div>

          <div class="product-image">
            <img [src]="recommendation.product.imageUrl || '/assets/images/placeholder-product.jpg'" 
                 [alt]="recommendation.product.name"
                 (error)="onImageError($event)">
            <div class="rating-overlay" *ngIf="recommendation.product.averageRating > 0">
              <div class="mini-stars">
                <i class="fas fa-star" *ngFor="let star of [1,2,3,4,5]" 
                   [class.filled]="star <= recommendation.product.averageRating"></i>
              </div>
              <span class="rating-text">({{ recommendation.product.reviewCount }})</span>
            </div>
          </div>

          <div class="product-info">
            <h4 class="product-name">{{ recommendation.product.name }}</h4>
            <p class="product-category">{{ recommendation.product.category.name }}</p>
            <div class="product-footer">
              <span class="price">{{ recommendation.product.price | currency }}</span>
              <span class="reason" *ngIf="recommendation.reason">
                {{ recommendation.reason }}
              </span>
            </div>
          </div>

          <div class="recommendation-reason" *ngIf="showReasons && recommendation.reason">
            <i class="fas fa-lightbulb"></i>
            <span>{{ recommendation.reason }}</span>
          </div>
        </div>

        <!-- View All Button -->
        <div class="view-all-section" *ngIf="showViewAll">
          <button class="view-all-btn" (click)="onViewAll()">
            View All Recommendations
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <div class="no-recommendations" *ngIf="!isLoading && (!recommendations || recommendations.length === 0) && !error">
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h4>No recommendations yet</h4>
          <p *ngIf="!authService.isAuthenticated()">Log in to get personalized product recommendations</p>
          <p *ngIf="authService.isAuthenticated()">Browse products to get started with recommendations</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-recommendations.component.css']
})
export class ProductRecommendationsComponent implements OnInit {
  @Input() userId?: number;
  @Input() limit: number = 5;
  @Input() title: string = 'Recommended for You';
  @Input() subtitle?: string;
  @Input() showReasons: boolean = true;
  @Input() showViewAll: boolean = true;
  @Input() recommendationTypes?: string[];
  @Output() recommendationClicked = new EventEmitter<ProductRecommendation>();
  @Output() viewAllClicked = new EventEmitter<void>();

  recommendations: ProductRecommendation[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private recommendationService: RecommendationService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRecommendations();
  }

  loadRecommendations() {
    this.isLoading = true;
    this.error = null;

    const currentUser = this.authService.getUser();
    const targetUserId = this.userId || currentUser?.id;

    if (!targetUserId) {
      this.isLoading = false;
      this.recommendations = [];
      return;
    }

    const params: any = {
      userId: targetUserId,
      limit: this.limit,
      sortBy: 'score',
      sortOrder: 'desc'
    };

    if (this.recommendationTypes && this.recommendationTypes.length > 0) {
      params.recommendationTypes = this.recommendationTypes;
    }

    this.recommendationService.getRecommendations(params).subscribe({
      next: (recommendations) => {
        this.recommendations = recommendations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
        this.error = 'Failed to load recommendations. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onRecommendationClick(recommendation: ProductRecommendation) {
    // Mark as clicked
    this.recommendationService.markRecommendationClicked(recommendation.productId).subscribe();
    
    // Emit event
    this.recommendationClicked.emit(recommendation);

    // Track behavior
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.getUser();
      if (currentUser) {
        this.recommendationService.trackProductView(currentUser.id, recommendation.productId);
      }
    }

    // Navigate to product
    // Note: You might want to use Router.navigate() here instead
    window.location.href = `/products/${recommendation.productId}`;
  }

  onViewAll() {
    this.viewAllClicked.emit();
    // Navigate to full recommendations page
    window.location.href = '/recommendations';
  }

  trackByRecommendationId(index: number, recommendation: ProductRecommendation): number {
    return recommendation.id;
  }

  getRecommendationTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'collaborative': 'Because you viewed',
      'content_based': 'Similar products',
      'trending': 'Trending now',
      'personalized': 'Perfect for you'
    };
    return labels[type] || type;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/placeholder-product.jpg';
  }
}