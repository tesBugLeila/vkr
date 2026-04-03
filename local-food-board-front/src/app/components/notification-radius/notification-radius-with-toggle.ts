import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-notification-radius',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-radius-with-toggle.html',
  styleUrl: './notification-radius.scss',
})
export class NotificationRadius implements OnInit, OnDestroy {
  notificationsEnabled = false;
  radius = 5000;
  saving = false;
  saved = false;
  error = '';
  private saveTimeout?: any;
  private userSubscription?: Subscription;
  private isManualUpdate = false;

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  get radiusKm(): string {
    if (this.radius < 1000) return `${this.radius}м`;
    return `${(this.radius / 1000).toFixed(1)} км`;
  }

  ngOnInit() {
    // ИСПРАВЛЕНИЕ: filter(user => !!user) — пропускаем null,
    // реагируем только когда данные пользователя реально загружены
    this.userSubscription = this.userService.currentUser$.pipe(
      filter(user => !!user)
    ).subscribe(user => {
      if (this.isManualUpdate) return;

      const userRadius = user!.notificationRadius;
      const radius = userRadius !== null && userRadius !== undefined
        ? Number(userRadius)
        : 0;

      if (radius > 0) {
        this.notificationsEnabled = true;
        this.radius = radius;
      } else {
        this.notificationsEnabled = false;
        this.radius = 5000;
      }

      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
  }

  onNotificationsToggle() {
    if (this.notificationsEnabled) this.saveRadius();
    else this.saveRadiusValue(0);
  }

  onRadiusChange() {
    if (this.notificationsEnabled) this.saveRadius();
  }

  setRadius(meters: number) {
    this.radius = meters;
    if (this.notificationsEnabled) this.saveRadius();
  }

  private saveRadius() {
    this.saveRadiusValue(this.notificationsEnabled ? this.radius : 0);
  }

  private saveRadiusValue(radiusValue: number) {
    this.saving = true;
    this.saved = false;
    this.error = '';
    this.isManualUpdate = true;
    this.cdr.detectChanges();

    this.http.put('/api/users/notification-radius', { radius: radiusValue }).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
        setTimeout(() => {
          this.isManualUpdate = false;
          this.userService.me();
        }, 500);
        this.cdr.detectChanges();
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
          this.saved = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Ошибка сохранения';
        this.isManualUpdate = false;
        this.cdr.detectChanges();
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
          this.error = '';
          this.cdr.detectChanges();
        }, 5000);
      }
    });
  }
}