import { Component, OnInit } from '@angular/core';
import { Post } from '../post/post';
import { IPost } from '../../types/post';
import { PostService } from '../../services/post';
import { Loading } from '../loading/loading';
import { finalize, Observable } from 'rxjs';

@Component({
  selector: 'app-list',
  imports: [Post, Loading],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  standalone: true,
})
export class List implements OnInit {
  posts: IPost[];
  loading = true;
  constructor(private postService: PostService) {}
  public ngOnInit() {
    this.postService
      .list()
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((list) => {
        this.posts = list.posts;
      });
  }
}
