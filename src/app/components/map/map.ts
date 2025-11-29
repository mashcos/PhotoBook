import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { latLng, tileLayer, MapOptions, marker, Marker, icon, Icon } from 'leaflet';
import { PhotoService } from '../../services/photo.service';
import { Photo } from '../../models/models';

// Fix for default marker icons in Leaflet
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-map',
  imports: [LeafletModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class MapComponent implements OnInit {
  private readonly photoService = inject(PhotoService);
  private readonly router = inject(Router);

  protected readonly photos = toSignal(this.photoService.getPhotos(), {
    initialValue: [] as Photo[],
  });

  protected readonly markers = signal<Marker[]>([]);

  protected readonly mapOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }),
    ],
    zoom: 6,
    center: latLng(51.1657, 10.4515), // Germany center
  };

  ngOnInit(): void {
    this.updateMarkers();
  }

  private updateMarkers(): void {
    const photos = this.photos();
    const newMarkers = photos
      .filter((p) => p.location.lat !== 0 && p.location.lng !== 0)
      .map((photo) => {
        const m = marker([photo.location.lat, photo.location.lng], {
          title: photo.title,
          icon: icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        });

        m.bindPopup(`
          <div style="text-align: center; min-width: 150px;">
            <h4 style="margin: 0 0 8px; color: #e65100;">${photo.title}</h4>
            <p style="margin: 0 0 8px; font-size: 0.875rem; color: #616161;">${photo.location.name}</p>
            <button onclick="window.dispatchEvent(new CustomEvent('navigateToPhoto', {detail: '${photo.id}'}))" 
                    style="background: #ff9800; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
              View Photo
            </button>
          </div>
        `);

        return m;
      });

    this.markers.set(newMarkers);

    // Listen for navigation events from popups
    window.addEventListener('navigateToPhoto', ((event: CustomEvent) => {
      this.router.navigate(['/hub', event.detail]);
    }) as EventListener);
  }
}
