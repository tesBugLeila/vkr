import { ChangeDetectorRef, Component, DestroyRef,  Input,  OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPost } from '../../types/post';
import { PostService } from '../../services/post';
import { first } from 'rxjs';
import { UserService } from '../../services/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-post-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './post-edit.html',
  styleUrl: './post-edit.scss',
  standalone: true,
})
export class PostEdit implements OnInit {
  @Input() postData?: IPost;
  postForm!: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef,

    protected postService: PostService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((me) => {
      if (!me) {
        return;
      }
      this.initForm();
      if (this.postData) {
        this.postForm.patchValue(this.postData);
      } else {
        this.getLocation();
      }
    });
  }

  private initForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['OTHER', [Validators.required]],
      district: ['Центральный'],
      photos: [[]],
      lat: [null],
      lon: [null],
      notifyNeighbors: [false],
      // Скрытые поля сохраняем в форме или обрабатываем отдельно при отправке
      id: [undefined],
      contact: [this.userService.currentUser$.value?.phone],
      userId: [this.userService.currentUser$.value?.id],
      createdAt: [ formatDate(new Date(), 'dd.MM.yyyy HH:mm','en-US')],
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
          (resp) => {
            this.error = '';
            console.log(resp);
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
