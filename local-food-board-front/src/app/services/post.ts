import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IList, IPagination } from '../types/list';
import { IPost } from '../types/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private http: HttpClient) {}

  public readonly categories = [
    'Другое',
    'Пироги',
    'Варенье и джемы',
    'Овощи',
    'Молочные продукты',
    'Мясо',
    'Выпечка',
  ];

  list(page = 1, limit = 10): Observable<IList<IPost>> {
    return this.http.get<IList<IPost>>('/api/posts', { params: { page, limit } });
  }
  create(post: IPost): Observable<IPost> {
    return this.http.post<IPost>('/api/posts', post);
  }
}
