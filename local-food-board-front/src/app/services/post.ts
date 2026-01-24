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
  public readonly categories = ['PIES', 'JAMS', 'VEGETABLES', 'DAIRY', 'MEAT', 'BAKERY', 'OTHER'];
  public filterUpdated$ = new BehaviorSubject<boolean>(false);
  public searchBar: IPostFilter = {
    lat: undefined,
    lon: undefined,
    radius: undefined,
    category: undefined,
    district: undefined,
    q: undefined,
  };

  list(page: number, limit: number): Observable<IList<IPost>> {
    let filter = Object.fromEntries(
      Object.entries(this.searchBar).filter(([key, value]) => value !== undefined),
    );
    return this.http.get<IList<IPost>>('/api/posts', { params: { ...filter, page, limit } });
  }

  getById(postId: string): Observable<IPostWrapper> {
    return this.http.get<IPostWrapper>(`/api/posts/${postId}`);
  }

  save(post: IPost): Observable<IPostWrapper> {
    if (post.id) {
      const data = { ...post, id: undefined, userId: undefined, createdAt: undefined };
      return this.http.patch<IPostWrapper>(`/api/posts/${post.id}`, data);
    } else {
      return this.http.post<IPostWrapper>('/api/posts', post);
    }
  }
  delete(post: IPost): Observable<IPostWrapper> {
    return this.http.delete<IPostWrapper>(`/api/posts/${post.id}`);
  }
}
