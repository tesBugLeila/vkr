import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { IPost } from '../../../types/post';
import { PostService } from '../../../services/post.service';
import { first } from 'rxjs';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-phone',
  imports: [],
  templateUrl: './phone.html',
  styleUrl: './phone.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Phone implements OnInit {
  @Input() public data?: IPost;
  @Input() public autoLoad = false;
  loading = false;
  tel = '';
  error = '';
  phone = '';
  isPhoneRevealed = false; // ← флаг: показывать ли полный телефон

  constructor(
    private cdr: ChangeDetectorRef,
    protected postService: PostService,
    public userService: UserService,
  ) {}

  ngOnInit() {
    this.transform();
    console.log(this.userService.currentUser$.value?.id);
    if (this.autoLoad && this.userService.currentUser$.value?.id) {
      this.loadPhone();
    }
  }

  clickOnPhone($event: PointerEvent) {
    $event.stopPropagation();
  }

  loadPhone($event?: PointerEvent) {
    $event?.stopPropagation();
    if (!this.data?.id) {
      return;
    }
    this.loading = true;
    this.cdr.detectChanges();
    this.postService
      .getContactById(this.data!.id)
      .pipe(first()) // Берем только первое значение
      .subscribe(
        (phone: string) => {
          this.isPhoneRevealed = true; // ← Раскрываем телефон
          this.data!.contact = phone; // Сохраняем полный номер
          this.tel = phone; // Сохраняем номер для ссылки tel:
          this.loading = false;
          this.transform(); // Обновляем отображение
        },
        (error) => {
          this.error =
            error.status === 401 ? 'Авторезуйте чтобы посмотреть номер' : 'Не удалось загрузить номер';
          console.log(this.error);
          this.cdr.detectChanges();
        },
      );
  }

  transform() {
    if (this.data?.contact) {
      const phoneSrc = this.data.contact.toString();

      if (!phoneSrc?.length) {
        return;
      }

      if (this.isPhoneRevealed) {
        // Показываем полный телефон
        this.phone = `${phoneSrc[0]}${phoneSrc[1]}-${phoneSrc.substring(2, 5)}-${phoneSrc.substring(5, 8)}-${phoneSrc.substring(8, 10)}-${phoneSrc.substring(10, 12)}`;
      } else {
        // Показываем частично скрытый телефон
        const visiblePart = `${phoneSrc[0]}${phoneSrc[1]}-${phoneSrc.substring(2, 5)}-${phoneSrc.substring(5, 8)}`;
        const hiddenPart = '-XX-XX';
        this.phone = visiblePart + hiddenPart;
      }
    }
    this.cdr.detectChanges();
  }
}
