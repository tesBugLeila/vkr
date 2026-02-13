import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgxMaskPipe } from 'ngx-mask';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { NotificationsBadge } from '../notifications-badge/notifications-badge';

@Component({
  selector: 'app-login-bar',
  imports: [RouterLink, AsyncPipe, NgxMaskPipe, NotificationsBadge],
  templateUrl: './login-bar.html',
  styleUrl: './login-bar.scss',
  standalone: true,
})
export class LoginBar {
  showMenu = false;
  constructor(
    public userService: UserService,
    private router: Router,
  ) {}

  logOut() {
    this.userService.currentUser$.next(null)
    document.cookie = `access-token=; path=/`;
    this.router.navigate(['/']).then();
  }
  hideMenu(){
    setTimeout(() => {
      this.showMenu = false
    },800);
  }
}
