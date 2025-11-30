import { Component, Input } from '@angular/core';
import { IPost } from '../../types/post';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-post',
  imports: [
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './post.html',
  styleUrl: './post.scss',
  standalone: true,
})
export class Post {
  @Input() public data?: IPost;
}
