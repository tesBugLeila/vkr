import { Component } from '@angular/core';
import { PostService } from '../../services/post.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  standalone: true,
})
export class SearchBar {
  public locationStr: string | undefined = undefined;

  public locationOptions = [
    { name: 'Искать везде', value: undefined },
    { name: 'Кинель', value: { lat: 53.2211, lon: 50.6257, radius: 5000 } },
    { name: 'Усть-Кинельский', value: { lat: 53.2700, lon: 50.5830, radius: 3000 } },
    { name: 'Алексеевка', value: { lat: 53.2536, lon: 50.4920, radius: 5000 } },
//    { name: 'Томск', value: { lat: 56.4728, lon: 85.0458, radius: 10000 } },
    { name: 'Москва', value: { lat: 55.7530, lon: 37.6221, radius: 25000 } },
    { name: 'Самара', value: { lat: 53.2066, lon: 50.1354, radius: 15000 } },
    { name: 'Казань', value: { lat: 55.7973, lon: 49.1037, radius: 20000 } },
  ];

  constructor(public postService: PostService) {}

  listReload(): void {
    this.postService.filterUpdated$.next(true);
  }

  changeLocation(value: string | undefined): void {
    if (!value) {
      this.postService.searchBar.lat = undefined;
      this.postService.searchBar.lon = undefined;
      this.postService.searchBar.radius = undefined;
    } else {
      const location = this.locationOptions.find(opt => opt.name === value)?.value;
      if (location && typeof location === 'object') {
        this.postService.searchBar.lat = location.lat;
        this.postService.searchBar.lon = location.lon;
        this.postService.searchBar.radius = location.radius;
      }
    }
    this.postService.filterUpdated$.next(true);
  }
}
