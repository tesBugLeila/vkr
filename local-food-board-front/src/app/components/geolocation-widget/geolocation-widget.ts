import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';
import { UserService } from '../../services/user.service';
import { interval, Subscription } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';

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
  private userSub?: Subscription;
  private readonly UPDATE_INTERVAL = 10 * 60 * 1000;

  constructor(
    private notificationsService: NotificationsService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userSub = this.userService.currentUser$.pipe(
      filter(user => !!user),
      // ИСПРАВЛЕНИЕ: реагируем только если lastLat реально изменился
      distinctUntilChanged((a, b) =>
        a?.lastLat === b?.lastLat &&
        a?.lastLon === b?.lastLon &&
        a?.lastLocationUpdate === b?.lastLocationUpdate
      )
    ).subscribe(user => {
      const lat = user!.lastLat;
      const lon = user!.lastLon;

      console.log('[GeolocationWidget] user received:', { lat, lon, lastLocationUpdate: user!.lastLocationUpdate });

      const hasLocation = lat !== null && lat !== undefined
                       && lon !== null && lon !== undefined;

      console.log('[GeolocationWidget] hasLocation:', hasLocation);

      if (hasLocation) {
        this.isLocationEnabled = true;
        this.lastUpdate = user!.lastLocationUpdate || '';
        if (localStorage.getItem('geolocation_enabled') === 'true') {
          this.startAutoUpdate();
        }
      } else {
        this.isLocationEnabled = false;
        this.lastUpdate = '';
        this.stopAutoUpdate();
      }

      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
    this.stopAutoUpdate();
  }

  async enableLocation() {
    this.isLoading = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      const location = await this.notificationsService.getCurrentLocation();
      await this.notificationsService.updateLocation(location.lat, location.lon).toPromise();

      this.isLocationEnabled = true;
      this.lastUpdate = new Date().toLocaleString('ru-RU', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
      localStorage.setItem('geolocation_enabled', 'true');
      this.startAutoUpdate();
      this.userService.me();
      this.isLoading = false;
      this.cdr.detectChanges();
    } catch (error: any) {
      this.isLoading = false;
      this.isLocationEnabled = false;
      if (error.code === 1) this.error = 'Доступ к геолокации запрещен';
      else if (error.code === 2) this.error = 'Геолокация недоступна';
      else if (error.code === 3) this.error = 'Таймаут получения локации';
      else this.error = 'Ошибка получения геолокации';
      this.cdr.detectChanges();
    }
  }

  async disableLocation() {
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      await this.notificationsService.clearLocation().toPromise();
      this.isLocationEnabled = false;
      this.lastUpdate = '';
      localStorage.removeItem('geolocation_enabled');
      this.stopAutoUpdate();
      this.userService.me();
      this.isLoading = false;
      this.cdr.detectChanges();
    } catch (error) {
      this.isLocationEnabled = false;
      this.lastUpdate = '';
      localStorage.removeItem('geolocation_enabled');
      this.stopAutoUpdate();
      this.isLoading = false;
      this.error = 'Ошибка отключения';
      this.cdr.detectChanges();
    }
  }

  private startAutoUpdate() {
    this.stopAutoUpdate();
    this.updateInterval = interval(this.UPDATE_INTERVAL).subscribe(async () => {
      try {
        const location = await this.notificationsService.getCurrentLocation();
        await this.notificationsService.updateLocation(location.lat, location.lon).toPromise();
        this.lastUpdate = new Date().toLocaleString('ru-RU', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        });
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Ошибка автообновления:', error);
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