import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchBar } from './components/search-bar/search-bar';

@Component({
  selector: 'app-root',
  imports: [SearchBar, RouterOutlet],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss',
})
export class App {}
