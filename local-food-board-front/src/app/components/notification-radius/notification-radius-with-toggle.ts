import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notification-radius',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-radius-with-toggle.html', 
  styleUrl: './notification-radius.scss',   
})
export class NotificationRadius implements OnInit {
  notificationsEnabled = true; // Включены ли уведомления
  radius = 5000; // По умолчанию 5 км
  saving = false;
  saved = false;
  error = '';
  private saveTimeout?: any;

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  get radiusKm(): string {
    if (this.radius < 1000) {
      return `${this.radius}м`;
    }
    return `${(this.radius / 1000).toFixed(1)} км`;
  }

  ngOnInit() {
    // Загружаем радиус из профиля пользователя
    this.userService.currentUser$.subscribe(user => {
      if (user && (user as any).notificationRadius !== undefined) {
        const userRadius = (user as any).notificationRadius;
        
        // Если радиус = 0, значит уведомления отключены
        if (userRadius === 0) {
          this.notificationsEnabled = false;
          this.radius = 5000; // Показываем 5км по умолчанию, но не активно
        } else {
          this.notificationsEnabled = true;
          this.radius = userRadius;
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  onNotificationsToggle() {
    if (this.notificationsEnabled) {
      // Включаем уведомления - сохраняем текущий радиус
      this.saveRadius();
    } else {
      // Отключаем уведомления - устанавливаем радиус 0
      this.saveRadiusValue(0);
    }
  }

  onRadiusChange() {
    if (this.notificationsEnabled) {
      this.saveRadius();
    }
  }

  setRadius(meters: number) {
    this.radius = meters;
    if (this.notificationsEnabled) {
      this.saveRadius();
    }
  }

  private saveRadius() {
    // Сохраняем текущий радиус (если уведомления включены)
    this.saveRadiusValue(this.notificationsEnabled ? this.radius : 0);
  }

  private saveRadiusValue(radiusValue: number) {
    this.saving = true;
    this.saved = false;
    this.error = '';
    this.cdr.detectChanges();

    // Отправляем на сервер
    this.http.post('/api/notifications/update-location', { radius: radiusValue })
      .subscribe({
        next: () => {
          this.saving = false;
          this.saved = true;
          
          // Обновляем данные пользователя
          this.userService.me();
          
          this.cdr.detectChanges();

          // Скрываем сообщение через 3 секунды
          if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
          }
          this.saveTimeout = setTimeout(() => {
            this.saved = false;
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Ошибка сохранения';
          this.cdr.detectChanges();
          
          // Скрываем ошибку через 5 секунд
          if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
          }
          this.saveTimeout = setTimeout(() => {
            this.error = '';
            this.cdr.detectChanges();
          }, 5000);
        }
      });
  }
}