import { Component, Input, OnInit } from '@angular/core';
import { IPost } from '../../../types/post';
import { LeafletDirective } from '@bluehalo/ngx-leaflet';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { latLng, MapOptions, marker, tileLayer } from 'leaflet';

@Component({
  selector: 'app-map',
  imports: [LeafletDirective, LeafletModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
  standalone: true,
})
export class Map implements OnInit {
  @Input() public data?: IPost;
  options: MapOptions;

  ngOnInit() {
    if(!this.data?.lat &&  !this.data?.lon){
      return
    }
    this.options = {
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '...',
        }),
        marker(latLng(this.data.lat!, this.data.lon!))
      ],
      zoom: 9,
      center: latLng(this.data.lat!, this.data.lon!),

    };
  }
}
