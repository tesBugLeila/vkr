import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-bar',
  imports: [
    RouterLink
  ],
  templateUrl: './login-bar.html',
  styleUrl: './login-bar.scss',
  standalone: true,
})
export class LoginBar {

}
