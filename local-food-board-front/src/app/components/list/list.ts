import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { Post } from '../post/post';
import { IPost } from '../../types/post';
import { PostService } from '../../services/post';
import { Loading } from '../loading/loading';
import { debounce, debounceTime, finalize, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  readonly limit = 10;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef,

    private postService: PostService,
  ) {}

  get pages(): number[] {
    if (this.totalPages === 1) {
      return [];
    }
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  public ngOnInit() {
    this.loadPage(1);
    this.postService.filterUpdated$.pipe(debounceTime(1000),takeUntilDestroyed(this.destroyRef)).subscribe((emited) => {
      if(!emited){
        return;
      }
      this.loadPage(1)
    });
  }
  public loadPage(pageNumber: number) {
    this.loading = true;
    this.cdr.detectChanges();
    this.currentPage = pageNumber;
    this.postService
      .list(this.currentPage, this.limit)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((list) => {
        this.posts = list.posts;
        this.totalPages = list.pagination.pages;
        this.cdr.detectChanges();
      });
  }
}
