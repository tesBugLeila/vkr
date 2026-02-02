import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { UserService } from '../../services/user.service';
import { AdminService, IAdminStats, IAdminUser, IAdminReport } from '../../services/admin.service';
import { Loading } from '../loading/loading';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, Loading],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  activeTab: 'stats' | 'users' | 'reports' = 'stats';
  loading = false;

  // Статистика
  stats: IAdminStats | null = null;

  // Пользователи
  users: IAdminUser[] = [];
  usersPage = 1;
  usersTotalPages = 1;
  usersSearch = '';

  // Жалобы
  reports: IAdminReport[] = [];
  reportsPage = 1;
  reportsTotalPages = 1;
  reportsStatusFilter = '';

  // Модальные окна
  selectedUser: IAdminUser | null = null;
  selectedReport: IAdminReport | null = null;
  blockReason = '';
  reportComment = '';
  reportStatus = '';

  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef,
  ) {}

ngOnInit() {
  this.userService.currentUser$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((user) => {
      if (!user) return; 

      if (user.role !== 'admin') {
        this.router.navigate(['/']).then();
        return;
      }

      this.loadStats();
    });
}


  switchTab(tab: 'stats' | 'users' | 'reports') {
    this.activeTab = tab;
    if (tab === 'stats') this.loadStats();
    if (tab === 'users') this.loadUsers();
    if (tab === 'reports') this.loadReports();
  }

  loadStats() {
    this.loading = true;
    this.adminService
      .getStats()
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe((data) => {
        this.stats = data.stats;
        this.cdr.detectChanges();
      });
  }

  loadUsers(page = 1) {
    this.loading = true;
    this.usersPage = page;
    this.adminService
      .listUsers(page, 20, this.usersSearch || undefined)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe((data) => {
        this.users = data.users;
        this.usersTotalPages = data.pagination.pages;
        this.cdr.detectChanges();
      });
  }

  searchUsers() {
    this.loadUsers(1);
  }

  openBlockModal(user: IAdminUser) {
    this.selectedUser = user;
    this.blockReason = '';
  }

  toggleBlock() {
    if (!this.selectedUser) return;
    const newBlockedState = !this.selectedUser.isBlocked;
    this.adminService
      .toggleBlockUser(this.selectedUser.id, newBlockedState, this.blockReason || undefined)
      .subscribe(() => {
        this.selectedUser = null;
        this.loadUsers(this.usersPage);
      });
  }

  deleteUserConfirm(user: IAdminUser) {
    if (!confirm(`Удалить пользователя ${user.phone}? Все его посты будут удалены.`)) return;
    this.adminService.deleteUser(user.id).subscribe(() => {
      this.loadUsers(this.usersPage);
    });
  }

  loadReports(page = 1) {
    this.loading = true;
    this.reportsPage = page;
    this.adminService
      .listReports(page, 20, this.reportsStatusFilter || undefined)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe((data) => {
        this.reports = data.reports;
        this.reportsTotalPages = data.pagination.pages;
        this.cdr.detectChanges();
      });
  }

  filterReports() {
    this.loadReports(1);
  }

  openReportModal(report: IAdminReport) {
    this.selectedReport = report;
    this.reportStatus = report.status;
    this.reportComment = report.adminComment || '';
  }

  updateReportStatus() {
    if (!this.selectedReport) return;
    this.adminService
      .updateReport(this.selectedReport.id, this.reportStatus, this.reportComment || undefined)
      .subscribe(() => {
        this.selectedReport = null;
        this.loadReports(this.reportsPage);
      });
  }

  get userPages(): number[] {
    return Array.from({ length: this.usersTotalPages }, (_, i) => i + 1);
  }

  get reportPages(): number[] {
    return Array.from({ length: this.reportsTotalPages }, (_, i) => i + 1);
  }
}