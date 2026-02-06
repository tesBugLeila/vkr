import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportsService, IReport } from '../../services/reports.service';
import { Loading } from '../loading/loading';
import { finalize } from 'rxjs';
import { DateAgoPipe } from '../../pipes/date-ago-pipe';
import { ParseDateTimePipe } from '../../pipes/parse-date-time-pipe';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, Loading, DateAgoPipe, ParseDateTimePipe],
  templateUrl: './my-reports.html',
  styleUrl: './my-reports.scss',
})
export class MyReports implements OnInit {
  reports: IReport[] = [];
  loading = false;

  constructor(
    private reportsService: ReportsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.reportsService
      .getMyReports()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.reports = data.reports;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Ошибка загрузки жалоб:', error);
        }
      });
  }
}