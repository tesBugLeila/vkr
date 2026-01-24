import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IList, IPagination } from '../types/list';
import { IPost, IPostWrapper } from '../types/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private http: HttpClient) {}
  public readonly categories = ['PIES', 'JAMS', 'VEGETABLES', 'DAIRY', 'MEAT', 'BAKERY', 'OTHER'];

  list(page: number, limit: number): Observable<IList<IPost>> {
    return this.http.get<IList<IPost>>('/api/posts', { params: { page, limit } });
  }

  getById(postId: string): Observable<IPostWrapper> {
    return this.http.get<IPostWrapper>(`/api/posts/${postId}`);
  }

  create(post: IPost): Observable<IPostWrapper> {
    return this.http.post<IPostWrapper>('/api/posts', post);
  }
}
