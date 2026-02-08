import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { ReportsService } from '../../services/reports.service';
import { Loading } from '../loading/loading';
import { Post } from '../post/post';
import { MyReports } from '../my-reports/my-reports';
import { GeolocationWidget } from '../geolocation-widget/geolocation-widget';
import { NotificationRadius } from '../notification-radius/notification-radius-with-toggle'
import { finalize } from 'rxjs';
import { IPost } from '../../types/post';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, 
    Loading,
    Post,
    MyReports,
    GeolocationWidget,
    NotificationRadius
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  activeTab: 'info' | 'settings' | 'posts' | 'reports' = 'info';
  loading = false;
  myPosts: IPost[] = [];
  reportsCount = 0;

  // Данные пользователя
  userName: string | null = null;
  userPhone: string = '';
  userCreatedAt: string = '';

  // Режим редактирования
  editMode = false;
  editName: string = '';
  editPhone: string = '';
  saving = false;
  saveError = '';
  saveSuccess = false;

  constructor(
    private postService: PostService,
    private userService: UserService,
    private reportsService: ReportsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Получаем данные пользователя
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
        this.userPhone = user.phone;
        this.userCreatedAt = user.createdAt || '';
        this.editName = user.name || '';
        this.editPhone = user.phone;
      }
    });

    // Загружаем объявления для статистики
    this.loadMyPosts();
    // Загружаем количество жалоб
    this.loadReportsCount();
  }

  switchTab(tab: 'info' | 'settings' | 'posts' | 'reports') {
    this.activeTab = tab;
    if (tab === 'posts') {
      this.loadMyPosts();
    }
  }

  loadMyPosts() {
    this.loading = true;
    
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

  loadReportsCount() {
    this.reportsService.getMyReports().subscribe({
      next: (data) => {
        this.reportsCount = data.reports.length;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Ошибка загрузки жалоб:', error);
      }
    });
  }

  enableEditMode() {
    this.editMode = true;
    this.editName = this.userName || '';
    this.editPhone = this.userPhone;
    this.saveError = '';
    this.saveSuccess = false;
  }

  cancelEdit() {
    this.editMode = false;
    this.editName = this.userName || '';
    this.editPhone = this.userPhone;
    this.saveError = '';
    this.saveSuccess = false;
  }

  saveProfile() {
    this.saving = true;
    this.saveError = '';
    this.saveSuccess = false;

    this.userService.updateMe(this.editName, this.editPhone)
      .pipe(finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          if (response.user) {
            this.userName = response.user.name;
            this.userPhone = response.user.phone;
            this.saveSuccess = true;
            
            // Обновляем текущего пользователя
            this.userService.me();
            
            // Закрываем режим редактирования через 1.5 секунды
            setTimeout(() => {
              this.editMode = false;
              this.saveSuccess = false;
              this.cdr.detectChanges();
            }, 1500);
          }
        },
        error: (error) => {
          this.saveError = error.error?.message || 'Не удалось обновить профиль';
        }
      });
  }


}