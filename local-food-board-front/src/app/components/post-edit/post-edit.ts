import { ChangeDetectorRef, Component, DestroyRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPost, IPostWrapper } from '../../types/post';
import { PostService } from '../../services/post';
import { first } from 'rxjs';
import { UserService } from '../../services/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryPipe } from '../../pipes/category-pipe';

@Component({
  selector: 'app-post-edit',
  imports: [ReactiveFormsModule, RouterLink, CategoryPipe],
  templateUrl: './post-edit.html',
  styleUrl: './post-edit.scss',
  standalone: true,
})
export class PostEdit implements OnInit {
  postForm!: FormGroup;
  editablePostId: null | string = null;
  error = '';

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private destroyRef: DestroyRef,

    protected postService: PostService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((me) => {
      if (!me) {
        return;
      }
      this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
        const postId = params.get('id');
        this.loadData(postId);
      });
    });
  }

  private loadData(id: string | null): void {
    this.initForm();
    if (id) {
      this.postService
        .getById(id)
        .pipe(first())
        .subscribe((data: IPostWrapper) => {
          this.editablePostId = data.post.id;
          this.postForm.patchValue(data.post);
        });
    }
    this.getLocation();
  }
  private initForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      district: ['Центральный'],
      photos: [[]],
      lat: [null],
      lon: [null],
      notifyNeighbors: [false],
      // Скрытые поля сохраняем в форме или обрабатываем отдельно при отправке
      id: [undefined],
      contact: [this.userService.currentUser$.value?.phone],
      userId: [this.userService.currentUser$.value?.id],
      createdAt: [formatDate(new Date(), 'dd.MM.yyyy HH:mm', 'en-US')],
    });
  }

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.postForm.patchValue({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      });
    }
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      this.postService
        .create(<IPost>this.postForm.value)
        .pipe(first())
        .subscribe(
          (resp: IPostWrapper) => {
            if (!resp.post.id) {
              this.error = 'Что-то пошло не так';
            } else {
              this.router.navigate(['post', resp.post.id]).then();
              this.error = '';
            }
            this.cdr.detectChanges();
          },
          (error) => {
            this.error = error.error.error || error.statusText;
            this.cdr.detectChanges();
          },
        );
    }
  }
}
