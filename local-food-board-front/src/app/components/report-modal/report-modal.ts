import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService, ICreateReportRequest } from '../../services/reports.service';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-modal.html',
  styleUrl: './report-modal.scss',
})
export class ReportModal implements OnInit {
  @Input() reportedUserId!: string;
  @Input() postId?: string;
  @Input() post?: { id: string; title: string } | null;
  @Input() reportedUser?: { phone: string; name?: string | null } | null;
  
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  formData: ICreateReportRequest = {
    reportedUserId: '',
    reason: '',
    description: '',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.formData.reportedUserId = this.reportedUserId;
    if (this.postId) {
      this.formData.postId = this.postId;
    }
  }

  onSubmit() {
    if (this.isSubmitting || !this.formData.reason) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: ICreateReportRequest = {
      reportedUserId: this.formData.reportedUserId,
      reason: this.formData.reason,
    };

    if (this.formData.postId) {
      payload.postId = this.formData.postId;
    }

    if (this.formData.description?.trim()) {
      payload.description = this.formData.description.trim();
    }

    this.reportsService.createReport(payload).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Жалоба успешно отправлена';
        this.isSubmitting = false;
        this.submitted.emit();
        
        // Закрываем модалку через 1.5 секунды после успеха
        setTimeout(() => {
          this.onClose();
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Не удалось отправить жалобу';
        this.isSubmitting = false;
      },
    });
  }

  onClose() {
    this.closed.emit();
  }
}