import { Component, Input } from '@angular/core';
import { IPost } from '../../types/post';
import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-post',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgOptimizedImage
  ],
  templateUrl: './post.html',
  styleUrl: './post.scss',
  standalone: true,
})
export class Post {
  @Input() public data?: IPost;
}
