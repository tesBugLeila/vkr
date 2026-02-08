import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationsService, INotification } from '../../services/notifications.service';
import { Loading } from '../loading/loading';
import { finalize } from 'rxjs';
import { DateAgoPipe } from '../../pipes/date-ago-pipe';
import { ParseDateTimePipe } from '../../pipes/parse-date-time-pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, Loading, DateAgoPipe, ParseDateTimePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  notifications: INotification[] = [];
  loading = false;
  showOnlyUnread = false;

  constructor(
    private notificationsService: NotificationsService,
    private cdr: ChangeDetectorRef
  ) {}

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.isRead);
  }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.notificationsService
      .getMyNotifications(this.showOnlyUnread)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.notifications = data.notifications;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Ошибка загрузки уведомлений:', error);
        }
      });
  }

  toggleFilter() {
    this.showOnlyUnread = !this.showOnlyUnread;
    this.loadNotifications();
  }

  markAsRead(notification: INotification) {
    if (notification.isRead) return;

    this.notificationsService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Ошибка отметки уведомления:', error);
      }
    });
  }

  markAllAsRead() {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Ошибка отметки всех уведомлений:', error);
      }
    });
  }

  deleteNotification(notificationId: string) {
    if (!confirm('Удалить это уведомление?')) return;

    this.notificationsService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Ошибка удаления уведомления:', error);
      }
    });
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters}м`;
    }
    return `${(meters / 1000).toFixed(1)}км`;
  }
}