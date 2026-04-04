import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GroupChatComponent } from './components/group-chat/group-chat.component';
import { PostFeedComponent } from './components/post-feed/post-feed.component';
import { ProductDiscussionComponent } from './components/product-discussion/product-discussion.component';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [
    CommonModule,
    PostFeedComponent,
    GroupChatComponent,
    ProductDiscussionComponent,
  ],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css'],
})
export class CommunityComponent {
  activeTab: 'feed' | 'chat' | 'discussions' = 'feed';

  setTab(tab: 'feed' | 'chat' | 'discussions'): void {
    this.activeTab = tab;
  }
}
