import { ChangeDetectorRef, Component, DestroyRef, Input, OnInit } from '@angular/core';
import { IPost, IPostWrapper } from '../../types/post';
import { CurrencyPipe } from '@angular/common';
import { DateAgoPipe } from '../../pipes/date-ago-pipe';
import { Phone } from './phone/phone';
import { ParseDateTimePipe } from '../../pipes/parse-date-time-pipe';
import { Loading } from '../loading/loading';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { first } from 'rxjs';
import { Map } from './map/map';
import { Lightbox } from '../lightbox/lightbox';

@Component({
  selector: 'app-post',
  imports: [
    CurrencyPipe,
    DateAgoPipe,
    Phone,
    ParseDateTimePipe,
    Loading,
    RouterLink,
    Map,
    Lightbox,
  ],
  templateUrl: './post.html',
  styleUrl: './post.scss',
  standalone: true,
})
export class Post implements OnInit {
  // Декоратор @Input для получения данных поста из родительского компонента
  @Input() public data?: IPost;
  
  // Флаг, показывающий находимся ли мы на отдельной странице поста
  isPostPage = false;
  
  // Индекс текущей отображаемой фотографии в карусели
  currentPhotoIndex = 0;

  // ─── Переменные для лайтбокса ───
  lightboxOpen = false;  // Открыт ли лайтбокс
  lightboxIndex = 0;     // Индекс фотографии в лайтбоксе

  constructor(
    private cdr: ChangeDetectorRef,        // Для ручного запуска обнаружения изменений
    private router: Router,                // Для навигации между страницами
    private activatedRoute: ActivatedRoute, // Для получения параметров маршрута
    private destroyRef: DestroyRef,        // Для автоматической отписки от Observable
    protected postService: PostService,    // Сервис для работы с постами
    public userService: UserService,       // Сервис для работы с пользователями
  ) {}

  // Геттер проверяет, принадлежит ли пост текущему пользователю
  get isMyPost(): boolean {
    // Если нет текущего пользователя или данных поста - возвращаем false
    if (!this.userService.currentUser$.value || !this.data) return false;
    // Сравниваем ID текущего пользователя с ID автора поста
    return this.userService.currentUser$.value.id === this.data.userId;
  }

  // Геттер проверяет наличие фотографий у поста
  get hasPhotos(): boolean {
    return !!this.data?.photos && this.data.photos.length > 0;
  }

  // Геттер возвращает URL текущей фотографии
  get currentPhoto(): string | null {
    if (!this.hasPhotos) return null;
    return this.data!.photos[this.currentPhotoIndex];
  }

  // Метод жизненного цикла - инициализация компонента
  ngOnInit(): void {
    // Подписываемся на изменения параметров маршрута
    this.activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef)) // Автоматическая отписка при уничтожении компонента
      .subscribe((params) => {
        // Проверяем, есть ли параметр 'id' в URL (значит это страница поста)
        this.isPostPage = params.has('id');
        const postId = params.get('id');
        // Если ID есть - загружаем данные поста
        if (postId) {
          this.loadData(postId);
        }
      });
  }

  // Обработчик клика по посту
  clickOnPost(): void {
    // Если нет данных поста или мы уже на странице поста - ничего не делаем
    if (!this.data?.id || this.isPostPage) return;
    // Переходим на страницу детального просмотра поста
    this.router.navigate(['post', this.data.id]).then();
  }

  // Метод загрузки данных поста по ID
  loadData(id: string): void {
    this.postService
      .getById(id)
      .pipe(first()) // Берем только первое значение и отписываемся
      .subscribe((data: IPostWrapper) => {
        // Сохраняем полученные данные
        this.data = data.post;
        // Сбрасываем индекс фотографии на первую
        this.currentPhotoIndex = 0;
        // Вручную запускаем обнаружение изменений
        this.cdr.detectChanges();
      });
  }

  // Переход к следующей фотографии в карусели
  nextPhoto(): void {
    if (!this.hasPhotos) return;
    // Используем модульную арифметику для циклического перебора
    this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.data!.photos.length;
  }

  // Переход к предыдущей фотографии в карусели
  prevPhoto(): void {
    if (!this.hasPhotos) return;
    // Используем модульную арифметику для циклического перебора (с обработкой отрицательных значений)
    this.currentPhotoIndex =
      (this.currentPhotoIndex - 1 + this.data!.photos.length) % this.data!.photos.length;
  }

  // Переход к конкретной фотографии по индексу
  goToPhoto(index: number): void {
    this.currentPhotoIndex = index;
  }

  // ─── Методы для работы с лайтбоксом ───
  
  // Открытие лайтбокса
  openLightbox(event: MouseEvent, index: number): void {
    event.stopPropagation(); // Останавливаем всплытие события, чтобы не сработал clickOnPost
    this.lightboxIndex = index; // Устанавливаем индекс для лайтбокса
    this.lightboxOpen = true;   // Открываем лайтбокс
    this.cdr.detectChanges();   // Обновляем представление
  }

  // Закрытие лайтбокса
  closeLightbox(): void {
    this.lightboxOpen = false; // Закрываем лайтбокс
    this.cdr.detectChanges();  // Обновляем представление
  }
}