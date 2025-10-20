import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  email = '';

  subscribeNewsletter(): void {
    if (this.email) {
      // TODO: Implement newsletter subscription
      console.log('Newsletter subscription:', this.email);
      this.email = '';
      alert('Thank you for subscribing!');
    }
  }
}
