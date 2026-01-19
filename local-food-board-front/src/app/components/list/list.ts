import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List implements OnInit {
  posts: IPost[];
  loading = true;
  constructor(private postService: PostService, private cdr: ChangeDetectorRef) {}
  public ngOnInit() {
    this.postService
      .list()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((list) => {
        this.posts = list.posts;
      });
  }
}
