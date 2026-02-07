import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { Loading } from '../loading/loading';
import { UserService } from '../../services/user.service';
import { finalize, first } from 'rxjs';
import { IUserResp } from '../../types/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgxMaskDirective, Loading],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
})
export class Login {
  state: 'phone' | 'loading' | 'code' | 'success' | 'failure' = 'phone';
  userPhoneNumber: string = '';
  confirmationCode: string = ''; // Это на самом деле пароль, но называется "код"
  errorMessage: string = '';
  isBlockedError = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private userService: UserService,
  ) {}

  sendPhone() {
    this.state = 'loading';
    setTimeout(() => {
      this.state = 'code';
      this.cdr.markForCheck();
    }, 1000);
  }

  sendCode() {
    this.state = 'loading';
    this.cdr.markForCheck();

    const phone = `+7${this.userPhoneNumber}`;

    this.userService
      .login(phone, this.confirmationCode)
      .pipe(
        first(),
        finalize(() => {
          this.cdr.markForCheck();
        }),
      )
      .subscribe(
        (resp: IUserResp) => {
          this.state = 'success';
          if (resp) {
            this.userService.currentUser$.next(resp.user);
            if (resp.token) {
              document.cookie = `access-token=${resp.token}; path=/; max-age=604800`; // 7 дней
            }
            setTimeout(() => {
              this.router.navigate(['/']).then();
            }, 800);
          }
        },
        (error) => {
          this.state = 'failure';
          this.errorMessage = error?.error?.message || error?.error?.error || error?.message || 'Неверный код, попробуйте ещё раз';
          this.confirmationCode = '';
          
          // Проверяем, это ли ошибка блокировки
          this.isBlockedError = this.errorMessage.includes('заблокирован');
          
          // Устанавливаем разное время показа в зависимости от типа ошибки
          const showTime = this.isBlockedError ? 10000 : 2000; // 10 сек для блокировки, 2 сек для остальных
          
          setTimeout(() => {
            this.state = 'phone';
            this.errorMessage = '';
            this.isBlockedError = false;
            this.cdr.markForCheck();
          }, showTime);
        },
      );
  }

  onTelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.userPhoneNumber.length === 10) {
      this.sendPhone();
    }
  }

  onCodeKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.confirmationCode.length >= 1) {
      this.sendCode();
    }
  }
}