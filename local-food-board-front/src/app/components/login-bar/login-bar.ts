import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user';
import { NgxMaskPipe } from 'ngx-mask';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-bar',
  imports: [RouterLink, NgxMaskPipe],
  templateUrl: './login-bar.html',
  styleUrl: './login-bar.scss',
  standalone: true,
})
export class LoginBar {
  constructor(
    public userService: UserService,
    private router: Router,
  ) {}

  logOut() {
    this.userService.userPhoneNumber = null;
    this.router.navigate(['/']).then();
  }
}
