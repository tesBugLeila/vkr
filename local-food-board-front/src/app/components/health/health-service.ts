import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  constructor(private http: HttpClient) {}

  healthStatus(): Observable<unknown> {
    return this.http.get('/api/health');
  }
}
