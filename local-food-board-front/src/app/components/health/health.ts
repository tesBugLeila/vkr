import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HealthService } from './health-service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-health',
  imports: [JsonPipe],
  standalone: true,
  templateUrl: './health.html',
  styleUrl: './health.scss',
})
export class Health implements OnInit {
  health: unknown;
  statusCode: number;
  constructor(public healthService: HealthService, private cdr: ChangeDetectorRef,) {}
  ngOnInit() {
    this.healthService.healthStatus().subscribe(
      (response) => {
        this.statusCode = 200;
        this.health = response;
        this.cdr.detectChanges();
      },
      (error) => {
        this.statusCode = error.status;
        this.health = error.error || error.statusText;
        console.log(this.statusCode,this.health);
        this.cdr.detectChanges();
      },
    );
  }
}
