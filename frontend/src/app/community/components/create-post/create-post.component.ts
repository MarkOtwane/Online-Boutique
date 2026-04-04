import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../../services/community.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostComponent {
  private readonly communityService = inject(CommunityService);
  private readonly authService = inject(AuthService);

  @Output() postCreated = new EventEmitter<void>();

  content = '';
  caption = '';
  imageFile: File | null = null;
  imagePreview: string | null = null;
  loading = false;

  get canCreate(): boolean {
    return this.authService.isAuthenticated();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.imageFile = file;

    if (!file) {
      this.imagePreview = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview =
        typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (!this.content.trim() || this.loading) {
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('content', this.content.trim());
    if (this.caption.trim()) {
      formData.append('caption', this.caption.trim());
    }
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.communityService.createCommunityPost(formData).subscribe({
      next: () => {
        this.reset();
        this.postCreated.emit();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating community post:', error);
        this.loading = false;
      },
    });
  }

  reset(): void {
    this.content = '';
    this.caption = '';
    this.imageFile = null;
    this.imagePreview = null;
  }
}
