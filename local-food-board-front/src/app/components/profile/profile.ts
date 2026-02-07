import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { Loading } from '../loading/loading';
import { Post } from '../post/post';
import { MyReports } from '../my-reports/my-reports';
import { finalize } from 'rxjs';
import { IPost } from '../../types/post';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    Loading,
    Post,
    MyReports
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  activeTab: 'posts' | 'reports' = 'posts';
  loading = false;
  myPosts: IPost[] = [];

  constructor(
    private postService: PostService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMyPosts();
  }

  switchTab(tab: 'posts' | 'reports') {
    this.activeTab = tab;
    if (tab === 'posts') {
      this.loadMyPosts();
    }
  }

  loadMyPosts() {
    this.loading = true;
    
    // Используем новый метод getMyPosts
    this.postService.getMyPosts()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.myPosts = data.posts;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Ошибка загрузки объявлений:', error);
        }
      });
  }
}