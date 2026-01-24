import { ChangeDetectorRef, Component, DestroyRef, Input, OnInit } from '@angular/core';
import { IPost, IPostWrapper } from '../../types/post';
import { CurrencyPipe, IMAGE_CONFIG, NgOptimizedImage } from '@angular/common';
import { DateAgoPipe } from '../../pipes/date-ago-pipe';
import { Phone } from './phone/phone';
import { ParseDateTimePipe } from '../../pipes/parse-date-time-pipe';
import { Loading } from '../loading/loading';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PostService } from '../../services/post';
import { UserService } from '../../services/user';
import { first } from 'rxjs';

@Component({
  selector: 'app-post',
  imports: [CurrencyPipe, DateAgoPipe, Phone, NgOptimizedImage, ParseDateTimePipe, Loading, RouterLink],
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
export class Post implements OnInit {
  @Input() public data?: IPost;
  isPostPage = false;
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private destroyRef: DestroyRef,

    protected postService: PostService,
    private userService: UserService,
  ) {}


  get isMyPost(): boolean {
    return this.userService.currentUser$.value?.id === this.data?.user?.id;
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.isPostPage = params.keys.includes('id')
      const postId = params.get('id');
      if (postId) {
        this.loadData(postId);
      }
    });
  }

  clickOnPost() {
    if (!this.data?.id) {
      return;
    }
    this.router.navigate(['post', this.data?.id]).then();
  }

  loadData(id: string) {
    this.postService
      .getById(id)
      .pipe(first())
      .subscribe((data: IPostWrapper) => {
        this.data = data.post;
        this.cdr.detectChanges();
      });
  }
}
