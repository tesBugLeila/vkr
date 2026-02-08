import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

export interface INotification {
  id: string;
  userId: string;
  postId: string;
  postTitle: string;
  distance: number;
  isRead: boolean;
  createdAt: string;
  post?: {
    id: string;
    title: string;
    category: string;
    price: number;
    photos: string[];
  };
}

export interface INotificationsResponse {
  notifications: INotification[];
  unreadCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  // Храним количество непрочитанных уведомлений
  public unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  /**
   * Получить мои уведомления
   */
  getMyNotifications(unreadOnly = false): Observable<INotificationsResponse> {
    let params = new HttpParams();
    if (unreadOnly) {
      params = params.set('unreadOnly', 'true');
    }
    
    return this.http.get<INotificationsResponse>('/api/notifications', { params }).pipe(
      tap(response => {
        this.unreadCount$.next(response.unreadCount);
      })
    );
  }

  /**
   * Отметить уведомление как прочитанное
   */
  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`/api/notifications/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Уменьшаем счетчик непрочитанных
        const current = this.unreadCount$.value;
        if (current > 0) {
          this.unreadCount$.next(current - 1);
        }
      })
    );
  }

  /**
   * Отметить все уведомления как прочитанные
   */
  markAllAsRead(): Observable<any> {
    return this.http.post('/api/notifications/read-all', {}).pipe(
      tap(() => {
        this.unreadCount$.next(0);
      })
    );
  }

  /**
   * Удалить уведомление
   */
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`/api/notifications/${notificationId}`);
  }

  /**
   * Обновить геолокацию пользователя
   */
  updateLocation(lat: number, lon: number): Observable<any> {
    return this.http.post('/api/notifications/update-location', { lat, lon });
  }

  /**
   * Запустить периодическую проверку новых уведомлений (каждые 30 секунд)
   */
  startPolling(): Observable<INotificationsResponse> {
    return interval(30000).pipe( // 30 секунд
      switchMap(() => this.getMyNotifications())
    );
  }

  /**
   * Получить текущую геолокацию браузера
   */
  getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается браузером'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Запросить разрешение на геолокацию и обновить на сервере
   */
  async requestAndUpdateLocation(): Promise<boolean> {
    try {
      const location = await this.getCurrentLocation();
      await this.updateLocation(location.lat, location.lon).toPromise();
      console.log('Геолокация обновлена:', location);
      return true;
    } catch (error) {
      console.error('Ошибка обновления геолокации:', error);
      return false;
    }
  }
}