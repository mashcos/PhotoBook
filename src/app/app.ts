import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { latLng, tileLayer, MapOptions } from 'leaflet';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, CardModule, LeafletModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('PhotoBook');

  // Leaflet map configuration with OpenStreetMap
  protected readonly mapOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    ],
    zoom: 5,
    center: latLng(48.8566, 2.3522) // Paris, France - example location
  };
}

