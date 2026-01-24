import { Component } from '@angular/core';
import { PostService } from '../../services/post';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  standalone: true,
})
export class SearchBar {
  constructor(protected postService: PostService) {}
}
