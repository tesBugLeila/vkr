import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';
import { UserService } from '../../services/user.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-geolocation-widget',
  standalone: true,
  imports: [CommonModule],
 templateUrl: './geolocation-widget.html',
  styleUrl: './geolocation-widget.scss'
})
export class GeolocationWidget implements OnInit, OnDestroy {
  isLocationEnabled = false;
  isLoading = false;
  error = '';
  lastUpdate = '';
  
  private updateInterval?: Subscription;
  private readonly UPDATE_INTERVAL = 10 * 60 * 1000; // 10 минут

  constructor(
    private notificationsService: NotificationsService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Проверяем, есть ли сохраненная геолокация
    const savedLocation = localStorage.getItem('geolocation_enabled');
    if (savedLocation === 'true') {
      this.enableLocation();
    }
  }

  ngOnDestroy() {
    this.stopAutoUpdate();
  }

  async enableLocation() {
    this.isLoading = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      // Запрашиваем разрешение и получаем координаты
      const location = await this.notificationsService.getCurrentLocation();
      
      // Отправляем на сервер
      await this.notificationsService.updateLocation(location.lat, location.lon).toPromise();
      
      // Успех!
      this.isLocationEnabled = true;
      this.lastUpdate = new Date().toLocaleString('ru-RU');
      localStorage.setItem('geolocation_enabled', 'true');
      
      // Запускаем автоматическое обновление
      this.startAutoUpdate();
      
      this.isLoading = false;
      this.cdr.detectChanges();
    } catch (error: any) {
      this.isLoading = false;
      this.isLocationEnabled = false;
      
      if (error.code === 1) {
        this.error = 'Доступ к геолокации запрещен';
      } else if (error.code === 2) {
        this.error = 'Геолокация недоступна';
      } else if (error.code === 3) {
        this.error = 'Таймаут получения локации';
      } else {
        this.error = 'Ошибка получения геолокации';
      }
      
      console.error('Ошибка геолокации:', error);
      this.cdr.detectChanges();
    }
  }

  disableLocation() {
    this.isLocationEnabled = false;
    this.lastUpdate = '';
    localStorage.removeItem('geolocation_enabled');
    this.stopAutoUpdate();
    this.cdr.detectChanges();
  }

  private startAutoUpdate() {
    // Останавливаем предыдущий интервал, если был
    this.stopAutoUpdate();
    
    // Обновляем каждые 10 минут
    this.updateInterval = interval(this.UPDATE_INTERVAL).subscribe(async () => {
      try {
        const location = await this.notificationsService.getCurrentLocation();
        await this.notificationsService.updateLocation(location.lat, location.lon).toPromise();
        this.lastUpdate = new Date().toLocaleString('ru-RU');
        this.cdr.detectChanges();
        console.log('📍 Геолокация автоматически обновлена');
      } catch (error) {
        console.error('Ошибка автообновления геолокации:', error);
      }
    });
  }

  private stopAutoUpdate() {
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
      this.updateInterval = undefined;
    }
  }
}