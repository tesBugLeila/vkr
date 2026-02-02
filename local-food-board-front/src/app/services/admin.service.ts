import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IAdminStats {
  totalUsers: number;
  totalPosts: number;
  totalReports: number;
  pendingReports: number;
  blockedUsers: number;
}

export interface IAdminUser {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface IAdminUserDetails {
  user: IAdminUser;
  stats: {
    postsCount: number;
    reportsAgainst: number;
    reportsMade: number;
  };
}

export interface IAdminReport {
  id: string;
  reason: string;
  description: string;
  status: string;
  adminComment?: string;
  createdAt: string;
  reporter: { id: string; phone: string; name: string | null };
  reportedUser: { id: string; phone: string; name: string | null };
  post?: { id: string; title: string } | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<{ stats: IAdminStats }> {
    return this.http.get<{ stats: IAdminStats }>('/api/admin/stats');
  }

  listUsers(page = 1, limit = 50, search?: string): Observable<{
    users: IAdminUser[];
    pagination: { total: number; page: number; pages: number };
  }> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (search) params.search = search;
    return this.http.get<any>('/api/admin/users', { params });
  }

  getUserDetails(id: string): Observable<IAdminUserDetails> {
    return this.http.get<IAdminUserDetails>(`/api/admin/users/${id}`);
  }

  toggleBlockUser(id: string, blocked: boolean, reason?: string): Observable<any> {
    return this.http.patch(`/api/admin/users/${id}/block`, { blocked, reason });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`/api/admin/users/${id}`);
  }

  listReports(page = 1, limit = 50, status?: string): Observable<{
    reports: IAdminReport[];
    pagination: { total: number; page: number; pages: number };
  }> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (status) params.status = status;
    return this.http.get<any>('/api/admin/reports', { params });
  }

  updateReport(id: string, status?: string, adminComment?: string): Observable<any> {
    return this.http.patch(`/api/admin/reports/${id}`, { status, adminComment });
  }
}