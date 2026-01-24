import { Component } from '@angular/core';
import { PostService } from '../../services/post';
import { CategoryPipe } from '../../pipes/category-pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [CategoryPipe, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  standalone: true,
})
export class SearchBar {
  public locationStr = undefined;
  public locationOptions = [
    { name: 'Искать везде', value: undefined },
    { name: 'Кинель', value: [53.2211, 50.6257, 5000] },
    { name: 'Усть-Кинельский', value: [53.2700, 50.583, 3000] },
    { name: 'Алексеевка', value: [53.2536, 50.4920, 5000] },
    { name: 'Томск', value: [56.4728, 85.0458, 10000] },
    { name: 'Москва', value: [55.7530, 37.6221, 25000] },
    { name: 'Самара', value: [53.2066, 50.1354, 15000] },
    { name: 'Казань', value: [55.7973, 49.1037, 20000] },
  ];

  constructor(public postService: PostService) {}

  listReload() {
    this.postService.filterUpdated$.next(true);
  }

  changeLocation(value: number[] | undefined) {
    if (value?.length === 3) {
      this.postService.searchBar.lat = value[0];
      this.postService.searchBar.lon = value[1];
      this.postService.searchBar.radius = value[2];
    } else {
      this.postService.searchBar.lat = undefined;
      this.postService.searchBar.lon = undefined;
      this.postService.searchBar.radius = undefined;
    }
    this.postService.filterUpdated$.next(true);
  }
}
