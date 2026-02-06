import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  postId: string | null;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  reportedUser?: {
    id: string;
    phone: string;
    name: string | null;
  };
  post?: {
    id: string;
    title: string;
  } | null;
}

export interface ICreateReportRequest {
  reportedUserId: string;
  postId?: string;
  reason: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private http: HttpClient) {}

  /**
   * Создать жалобу
   */
  createReport(data: ICreateReportRequest): Observable<{
    success: boolean;
    message: string;
    report: IReport;
  }> {
    return this.http.post<any>('/api/reports', data);
  }

  /**
   * Получить мои жалобы
   */
  getMyReports(): Observable<{ reports: IReport[] }> {
    return this.http.get<{ reports: IReport[] }>('/api/reports/my');
  }
}