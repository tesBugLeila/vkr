import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SearchBar } from './components/search-bar/search-bar';
import { LoginBar } from './components/login-bar/login-bar';

@Component({
  selector: 'app-root',
  imports: [SearchBar, RouterOutlet, RouterLink, LoginBar],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss',
})
export class App {}
