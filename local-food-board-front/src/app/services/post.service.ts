import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IList } from '../types/list';
import { IPost, IPostFilter, IPostWrapper } from '../types/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private http: HttpClient) {}

  // Категории (русские названия - как на бэкенде)
  public readonly categories = [
    'Пироги',
    'Варенье и джемы',
    'Овощи',
    'Молочные продукты',
    'Мясо',
    'Выпечка',
    'Другое',
  ];

  public filterUpdated$ = new BehaviorSubject<boolean>(false);
  
  public searchBar: IPostFilter = {
    lat: undefined,
    lon: undefined,
    radius: undefined,
    category: undefined,
    district: undefined,
    q: undefined,
  };

  /**
   * Получить список постов с фильтрацией
   */
  list(page: number, limit: number): Observable<IList<IPost>> {
    const filter = Object.fromEntries(
      Object.entries(this.searchBar).filter(([key, value]) => value !== undefined),
    );
    return this.http.get<IList<IPost>>('/api/posts', { 
      params: { ...filter, page: page.toString(), limit: limit.toString() } 
    });
  }


 /**
   * Получить посты текущего пользователя (для профиля)
   */
  getMyPosts(): Observable<{ posts: IPost[] }> {
    return this.http.get<{ posts: IPost[] }>('/api/posts/user/my-posts');
  }

  /**
   * Получить один пост по ID
   */
  getById(postId: string): Observable<IPostWrapper> {
    return this.http.get<IPostWrapper>(`/api/posts/${postId}`);
  }

  /**
   * Создать новый пост
   * Принимает FormData с файлами
   */
  create(formData: FormData): Observable<IPostWrapper> {
    return this.http.post<IPostWrapper>('/api/posts', formData);
  }

  /**
   * Обновить существующий пост
   */
  update(postId: string, formData: FormData): Observable<IPostWrapper> {
    return this.http.patch<IPostWrapper>(`/api/posts/${postId}`, formData);
  }

  /**
   * Удалить пост
   */
  delete(postId: string): Observable<{ ok: boolean; message: string }> {
    return this.http.delete<{ ok: boolean; message: string }>(`/api/posts/${postId}`);
  }
}