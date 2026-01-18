import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { Loading } from '../loading/loading';
import { UserService } from '../../services/user';

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
  constructor(
    private cdr: ChangeDetectorRef,
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
    setTimeout(() => {
      if (this.confirmationCode === '0000') {
        this.state = 'success';
        this.userService.userPhoneNumber = this.userPhoneNumber;
      } else {
        this.state = 'failure';
        setTimeout(() => {
          this.state = 'phone';
          this.cdr.markForCheck();
        }, 2000);
      }
      this.cdr.markForCheck();
    }, 1000);
  }
}
