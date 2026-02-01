import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPostWrapper } from '../../types/post';
import { PostService } from '../../services/post.service';
import { first } from 'rxjs';
import { UserService } from '../../services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Loading } from '../loading/loading';

@Component({
  selector: 'app-post-edit',
  imports: [ReactiveFormsModule, RouterLink, Loading],
  templateUrl: './post-edit.html',
  styleUrl: './post-edit.scss',
  standalone: true,
})
export class PostEdit implements OnInit {
  // Реактивная форма для создания/редактирования поста
  postForm!: FormGroup;
  
  // ID редактируемого поста (null при создании нового)
  editablePostId: string | null = null;
  
  // Сообщение об ошибке
  error = '';
  
  // Флаг показа предупреждения при удалении
  deleteWarning = false;
  
  // Флаг состояния загрузки
  loading = false;

  /** Файлы выбранные пользователем */
  selectedFiles: File[] = [];
  
  /** Существующие фото с сервера (при редактировании) */
  existingPhotos: string[] = [];
  
  /** DataURL превью для новых файлов */
  previewUrls: string[] = [];

  // Список доступных категорий для поста
  readonly categories = [
    'Пироги',
    'Варенье и джемы',
    'Овощи',
    'Молочные продукты',
    'Мясо',
    'Выпечка',
    'Другое',
  ];

  constructor(
    private fb: FormBuilder,              // Для создания реактивной формы
    private cdr: ChangeDetectorRef,       // Для ручного запуска обнаружения изменений
    private router: Router,               // Для навигации между страницами
    private activatedRoute: ActivatedRoute, // Для получения параметров маршрута
    private destroyRef: DestroyRef,       // Для автоматической отписки от Observable
    protected postService: PostService,   // Сервис для работы с постами
    private userService: UserService,     // Сервис для работы с пользователями
  ) {}

  // Метод жизненного цикла - инициализация компонента
  ngOnInit(): void {
    // Подписываемся на изменения текущего пользователя
    this.userService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef)) // Автоматическая отписка
      .subscribe((me) => {
        // Если пользователь не авторизован - перенаправляем на страницу входа
        if (!me) {
          this.router.navigate(['/login']).then();
          return;
        }
        // Подписываемся на изменения параметров маршрута
        this.activatedRoute.paramMap
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((params) => {
            // Загружаем данные поста для редактирования (если есть ID)
            this.loadData(params.get('id'));
          });
      });
  }

  // Приватный метод загрузки данных
  private loadData(id: string | null): void {
    this.initForm(); // Инициализируем форму
    if (id) {
      // Если есть ID - загружаем данные существующего поста
      this.postService
        .getById(id)
        .pipe(first()) // Берем только первое значение
        .subscribe((data: IPostWrapper) => {
          this.editablePostId = data.post.id; // Сохраняем ID редактируемого поста
          this.existingPhotos = [...(data.post.photos || [])]; // Копируем существующие фото
          
          // Заполняем форму значениями из загруженного поста
          this.postForm.patchValue({
            title: data.post.title,
            description: data.post.description,
            price: data.post.price,
            category: data.post.category,
            district: data.post.district,
            contact: data.post.contact,
            notifyNeighbors: data.post.notifyNeighbors,
            lat: data.post.lat,
            lon: data.post.lon,
          });
          
          this.cdr.detectChanges(); // Обновляем представление
        });
    } else {
      // Если ID нет - создаем новый пост и пытаемся получить геолокацию
      this.getLocation();
    }
  }

  // Приватный метод инициализации реактивной формы
  private initForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]], // Обязательное поле, мин. 3 символа
      description: ['', [Validators.required, Validators.minLength(10)]], // Обязательное, мин. 10 символов
      price: [0, [Validators.required, Validators.min(0)]], // Обязательное, не меньше 0
      category: ['Другое', Validators.required], // Обязательное, значение по умолчанию
      district: ['', Validators.required], // Обязательное
      contact: ['', [Validators.required, Validators.minLength(5)]], // Обязательное, мин. 5 символов
      notifyNeighbors: [false], // Необязательное, значение по умолчанию false
      lat: [null], // Необязательное
      lon: [null], // Необязательное
    });
  }

  // Метод получения геолокации пользователя
  getLocation(): void {
    if (!navigator.geolocation) return; // Проверяем поддержку геолокации
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // При успешном получении координат заполняем поля формы
        this.postForm.patchValue({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => console.warn('Геолокация недоступна'), // Обработка ошибки
    );
  }

  // ─── Методы для работы с файлами ───
  
  // Обработчик изменения выбора файлов
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // Ограничиваем количество файлов до 6
    const files = Array.from(input.files).slice(0, 6);
    this.selectedFiles = files; // Сохраняем выбранные файлы
    this.previewUrls = []; // Очищаем предыдущие превью

    // Генерируем превью для каждого файла
    let loaded = 0; // Счетчик загруженных превью
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Сохраняем превью по индексу для сохранения порядка
        this.previewUrls[index] = reader.result as string;
        loaded++;
        // Обновляем представление только когда все превью готовы
        if (loaded === files.length) {
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(file); // Читаем файл как DataURL
    });

    // Сбрасываем значение input, чтобы можно было выбрать те же файлы снова
    input.value = '';
  }

  // Удаление существующей фотографии (при редактировании)
  removeExistingPhoto(index: number): void {
    this.existingPhotos.splice(index, 1); // Удаляем из массива
    this.cdr.detectChanges(); // Обновляем представление
  }

  // Удаление превью новой фотографии
  removePreviewPhoto(index: number): void {
    this.selectedFiles.splice(index, 1); // Удаляем файл
    this.previewUrls.splice(index, 1);   // Удаляем превью
    this.cdr.detectChanges(); // Обновляем представление
  }

  // ─── Метод отправки формы ───
  
  onSubmit(): void {
    // Проверяем валидность формы
    if (this.postForm.invalid) {
      this.error = 'Заполните все обязательные поля';
      return;
    }

    this.loading = true; // Включаем состояние загрузки
    this.error = '';     // Очищаем предыдущие ошибки
    this.cdr.detectChanges(); // Обновляем представление

    // Создаем FormData для отправки файлов
    const formData = new FormData();

    // Добавляем текстовые поля формы
    Object.entries(this.postForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value)); // Преобразуем все значения в строки
      }
    });

    // Добавляем новые файлы
    this.selectedFiles.forEach((file) => {
      formData.append('photos', file);
    });

    // Особый случай: редактирование без новых файлов
    if (this.editablePostId && this.selectedFiles.length === 0 && this.existingPhotos.length > 0) {
      // Сохраняем остатки старых фото как JSON строку
      formData.append('photos', JSON.stringify(this.existingPhotos));
    }

    // Выбираем нужный запрос: создание или обновление
    const request$ = this.editablePostId
      ? this.postService.update(this.editablePostId, formData)
      : this.postService.create(formData);

    // Выполняем запрос
    request$.pipe(first()).subscribe({
      next: (resp: IPostWrapper) => {
        if (resp.post?.id) {
          // После успешного сохранения переходим на страницу поста
          this.router.navigate(['post', resp.post.id]).then();
        }
        this.loading = false; // Выключаем состояние загрузки
        this.cdr.detectChanges(); // Обновляем представление
      },
      error: (err) => {
        this.loading = false; // Выключаем состояние загрузки
        // Получаем сообщение об ошибке из ответа сервера
        this.error = err.error?.error || err.message || 'Ошибка сохранения';
        this.cdr.detectChanges(); // Обновляем представление
      },
    });
  }

  // ─── Методы для удаления поста ───
  
  onPostDelete(): void {
    // Первый клик - показываем предупреждение
    if (!this.deleteWarning) {
      this.deleteWarning = true;
      return;
    }
    
    // Второй клик - выполняем удаление
    if (!this.editablePostId) return;

    this.loading = true; // Включаем состояние загрузки
    this.cdr.detectChanges(); // Обновляем представление

    this.postService
      .delete(this.editablePostId)
      .pipe(first())
      .subscribe({
        next: () => this.router.navigate(['/']).then(), // После удаления переходим на главную
        error: (err) => {
          this.loading = false; // Выключаем состояние загрузки
          this.error = err.error?.error || err.message || 'Ошибка удаления'; // Сообщение об ошибке
          this.deleteWarning = false; // Сбрасываем предупреждение
          this.cdr.detectChanges(); // Обновляем представление
        },
      });
  }
}