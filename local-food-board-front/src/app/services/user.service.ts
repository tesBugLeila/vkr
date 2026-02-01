import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, first, Observable, throwError } from 'rxjs';
import { IUser, IUserResp } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public currentUser$ = new BehaviorSubject<IUser | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Регистрация нового пользователя
   */
  register(phone: string, password: string, name?: string): Observable<IUserResp> {
    return this.http.post<IUserResp>('/api/users/register', { phone, password, name });
  }

  /**
   * Вход в систему
   */
  login(phone: string, password: string): Observable<IUserResp> {
    return this.http.post<IUserResp>('/api/users/login', { phone, password });
  }

  /**
   * Получить данные текущего пользователя
   */
  me(): void {
    this.http
      .get<IUserResp>('/api/users/me')
      .pipe(
        first(),
        catchError((error) => {
          // Если токен невалиден - очищаем пользователя
          this.currentUser$.next(null);
          return throwError(() => error);
        })
      )
      .subscribe((me: IUserResp) => {
        if (me.user) {
          this.currentUser$.next(me.user);
        }
      });
  }

  /**
   * Обновить профиль
   */
  updateMe(name?: string, phone?: string): Observable<IUserResp> {
    return this.http.put<IUserResp>('/api/users/me', { name, phone });
  }

  /**
   * Получить публичные данные пользователя
   */
  getById(userId: string): Observable<IUserResp> {
    return this.http.get<IUserResp>(`/api/users/${userId}`);
  }

  /**
   * Выход из системы
   */
  logout(): void {
    this.currentUser$.next(null);
    document.cookie = 'access-token=; path=/; max-age=0';
  }
}