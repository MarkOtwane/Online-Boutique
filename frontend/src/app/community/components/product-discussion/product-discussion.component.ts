import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../interfaces/product';
import { CommunityDiscussion } from '../../../interfaces/community-post';
import { AuthService } from '../../../services/auth.service';
import { CommunityService } from '../../../services/community.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-discussion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-discussion.component.html',
  styleUrls: ['./product-discussion.component.css'],
})
export class ProductDiscussionComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly communityService = inject(CommunityService);
  private readonly authService = inject(AuthService);

  products: Product[] = [];
  discussions: CommunityDiscussion[] = [];
  selectedProductId = '';
  draft = '';
  loading = false;

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => (this.products = products),
      error: (error) => console.error('Error loading products:', error),
    });
  }

  get canPost(): boolean {
    return this.authService.isAuthenticated();
  }

  loadDiscussions(): void {
    if (!this.selectedProductId) {
      this.discussions = [];
      return;
    }

    this.loading = true;
    this.communityService
      .getDiscussions(Number(this.selectedProductId))
      .subscribe({
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

  submit(): void {
    if (!this.selectedProductId || !this.draft.trim()) {
      return;
    }

    this.communityService
      .createDiscussion(Number(this.selectedProductId), this.draft.trim())
      .subscribe({
        next: () => {
          this.draft = '';
          this.loadDiscussions();
        },
        error: (error) => console.error('Error creating discussion:', error),
      });
  }
}
