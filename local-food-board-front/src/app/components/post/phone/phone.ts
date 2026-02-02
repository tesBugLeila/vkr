import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { IPost } from '../../../types/post';

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
  loading = false;
  tel = '';
  phone = '';
  isPhoneRevealed = false; // ← флаг: показывать ли полный телефон

  constructor(
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.transform();
  }

  clickOnPhone($event: PointerEvent) {
    $event.stopPropagation();
  }

  loadPhone($event: PointerEvent) {
    $event.stopPropagation();
    this.loading = true;
    this.transform(); // Показываем loading состояние
    
    setTimeout(() => {
      this.isPhoneRevealed = true; // ← Раскрываем телефон
      this.tel = `+${this.data?.contact}`; // Сохраняем номер для ссылки tel:
      this.loading = false;
      this.transform(); // Обновляем отображение
    }, 500);
  }

  transform() {
    if (this.data?.contact) {
      const phoneSrc = this.data.contact.toString();

      if (!phoneSrc?.length) {
        return;
      }

      if (phoneSrc.length === 7) {
        // Для 7-значных номеров
        this.phone = `+${phoneSrc[0]} (${phoneSrc.substring(1, 4)}) ${phoneSrc.substring(4, 7)}-`;
        if (this.isPhoneRevealed) {
          this.phone += 'XX-XX'; // Показываем полный номер
        } else {
          this.phone += '░░-░░'; // Скрытая часть
        }
      }
      
      if (phoneSrc.length === 12) {
        // Для 12-значных номеров
        if (this.isPhoneRevealed) {
          // Показываем полный телефон
          this.phone = `${phoneSrc[0]}${phoneSrc[1]}-${phoneSrc.substring(2, 5)}-${phoneSrc.substring(5, 6)}-${phoneSrc.substring(6, 10)}-${phoneSrc.substring(10, 12)}`;
        } else {
          // Показываем частично скрытый телефон
          // Пример: 79-251-8-XXXX-XX
          const visiblePart = `${phoneSrc[0]}${phoneSrc[1]}-${phoneSrc.substring(2, 5)}-${phoneSrc.substring(5, 6)}`;
          const hiddenPart = '-XXXX-XX';
          this.phone = visiblePart + hiddenPart;
        }
      }
    }
    this.cdr.detectChanges();
  }
}