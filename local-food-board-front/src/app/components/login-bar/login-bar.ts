import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgxMaskPipe } from 'ngx-mask';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-login-bar',
  imports: [RouterLink, AsyncPipe, NgxMaskPipe],
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
    this.userService.currentUser$.next(null)
    document.cookie = `access-token=; path=/`;
    this.router.navigate(['/']).then();
  }
}
