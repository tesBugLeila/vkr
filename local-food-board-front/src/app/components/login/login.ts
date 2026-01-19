import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { Loading } from '../loading/loading';
import { UserService } from '../../services/user';
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
  confirmationCode: string = '';

  errorMassage: string = '';
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private userService: UserService,
  ) {}

  sendPhone() {
    this.state = 'loading';
    setTimeout(() => {
      this.state = 'code';
      console.log(this.state);
      this.cdr.markForCheck();
    }, 1000);
  }
  sendCode() {
    this.state = 'loading';
    this.userService
      .login(`+7${this.userPhoneNumber}`, this.confirmationCode)
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
              document.cookie = `access-token=${resp.token}; path=/`;
            }
          setTimeout(() => {
            this.router.navigate(['/']).then();
          }, 2000);


          }
        },
        (error) => {
          this.state = 'failure';
          this.errorMassage = error?.error?.error || error?.error || 'Неверный код попробуйте ещё';
          this.confirmationCode = '';
          setTimeout(() => {
            this.state = 'phone';
            this.cdr.markForCheck();
          }, 2000);
        },
      );
    // setTimeout(() => {
    //
    //   }
    //}, 1000);
  }
  onTelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendPhone();
    }
  }
  onCodeKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendCode();
    }
  }
}
