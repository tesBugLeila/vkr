import { Component, Input } from '@angular/core';
import { IPost } from '../../types/post';
import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import { DateAgoPipe } from '../../pipes/date-ago-pipe';
import { Phone } from './phone/phone';

@Component({
  selector: 'app-post',
  imports: [
    CurrencyPipe,

    DateAgoPipe,
    Phone,
    NgOptimizedImage
  ],
  templateUrl: './post.html',
  styleUrl: './post.scss',
  standalone: true,
})
export class Post {
  @Input() public data?: IPost;
}
