import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-radius',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-radius-with-toggle.html', 
  styleUrl: './notification-radius.scss',   
})
export class NotificationRadius implements OnInit, OnDestroy {
  notificationsEnabled = true;
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
    if (this.radius < 1000) {
      return `${this.radius}м`;
    }
    return `${(this.radius / 1000).toFixed(1)} км`;
  }

  ngOnInit() {
    // Подписываемся на изменения пользователя
    this.userSubscription = this.userService.currentUser$.subscribe(user => {

      if (this.isManualUpdate) {
        return;
      }

      if (user && (user as any).notificationRadius !== undefined) {
        const userRadius = (user as any).notificationRadius;
        
        if (userRadius === 0) {
          this.notificationsEnabled = false;
          this.radius = 5000;
        } else {
          this.notificationsEnabled = true;
          this.radius = userRadius;
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  }

  onNotificationsToggle() {
    if (this.notificationsEnabled) {
      this.saveRadius();
    } else {
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
    this.saveRadiusValue(this.notificationsEnabled ? this.radius : 0);
  }

  private saveRadiusValue(radiusValue: number) {
    this.saving = true;
    this.saved = false;
    this.error = '';
    this.isManualUpdate = true; 
    this.cdr.detectChanges();

    this.http.put('/api/users/notification-radius', { radius: radiusValue })
      .subscribe({
        next: () => {
          this.saving = false;
          this.saved = true;
       
          setTimeout(() => {
            this.isManualUpdate = false; 
            this.userService.me();
          }, 500);
          
          this.cdr.detectChanges();

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
          this.isManualUpdate = false; 
          this.cdr.detectChanges();
          
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