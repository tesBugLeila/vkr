import { Component } from '@angular/core';
import { PostService } from '../../services/post';
import { CategoryPipe } from '../../pipes/category-pipe';

@Component({
  selector: 'app-search-bar',
  imports: [
    CategoryPipe
  ],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  standalone: true,
})
export class SearchBar {
  constructor(protected postService: PostService) {}
}
