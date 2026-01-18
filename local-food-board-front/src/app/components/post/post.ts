import { Component, Input } from '@angular/core';
import { IPost } from '../../types/post';
import { CurrencyPipe, DatePipe, IMAGE_CONFIG, NgOptimizedImage } from '@angular/common';
import { DateAgoPipe } from '../../pipes/date-ago-pipe';
import { Phone } from './phone/phone';
import { ParseDateTimePipe } from '../../pipes/parse-date-time-pipe';

@Component({
  selector: 'app-post',
  imports: [CurrencyPipe, DateAgoPipe, Phone, NgOptimizedImage, ParseDateTimePipe],
  providers: [
    {
      provide: IMAGE_CONFIG,
      useValue: {
        placeholderResolution: 40,
      },
    },
  ],
  templateUrl: './post.html',
  styleUrl: './post.scss',
  standalone: true,
})
export class Post {
  @Input() public data?: IPost;
}
