import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SearchBar } from './components/search-bar/search-bar';
import { LoginBar } from './components/login-bar/login-bar';
import { UserService } from './services/user.service';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [SearchBar, RouterOutlet, RouterLink, LoginBar, AsyncPipe, DatePipe],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  constructor(public userService: UserService) {}
  now = new Date();

  ngOnInit() {
    this.userService.me();
  }
}
