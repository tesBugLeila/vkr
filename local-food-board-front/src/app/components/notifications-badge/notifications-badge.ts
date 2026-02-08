import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications-badge',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications-badge.html',
 styleUrl: './notifications-badge.scss', 
})
export class NotificationsBadge implements OnInit, OnDestroy {
  unreadCount = 0;
  private subscription?: Subscription;
  private pollingSubscription?: Subscription;

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit() {
    // Подписываемся на изменения счетчика
    this.subscription = this.notificationsService.unreadCount$.subscribe(
      count => this.unreadCount = count
    );

    // Загружаем начальное количество
    this.notificationsService.getMyNotifications().subscribe();

    // Запускаем периодическую проверку (каждые 30 секунд)
    this.pollingSubscription = this.notificationsService.startPolling().subscribe();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.pollingSubscription?.unsubscribe();
  }
}