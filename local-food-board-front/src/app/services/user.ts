import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { IUser, IUserResp } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public currentUser$ =  new BehaviorSubject<IUser | null>(null);

  constructor(private http: HttpClient) {}

  login(phone: string, password: string): Observable<IUserResp> {
    return this.http.post<IUserResp>('/api/users/login', { phone, password });
  }
  me(): void {
    this.http
      .get<IUserResp>('/api/users/me')
      .pipe(first())
      .subscribe((me: IUserResp) => {
        if (me.user) {
          this.currentUser$.next(me.user);
        }
      });
  }
}
