import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [],
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lightbox {
  @Input() photos: string[] = [];
  @Input() startIndex = 0;
  @Output() closed = new EventEmitter<void>();

  currentIndex = 0;

  ngOnChanges() {
    this.currentIndex = this.startIndex;
  }

  get current(): string {
    return this.photos[this.currentIndex] ?? '';
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
  }

  goTo(i: number): void {
    this.currentIndex = i;
  }

  close(): void {
    this.closed.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':  this.prev();  break;
      case 'ArrowRight': this.next();  break;
      case 'Escape':     this.close(); break;
    }
  }
}