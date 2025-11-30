import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
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
export class MapComponent implements OnInit, OnDestroy {
  private readonly photoService = inject(PhotoService);
  private readonly router = inject(Router);
  private navigationHandler?: EventListener;

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
    // Set up navigation event listener once
    this.navigationHandler = ((event: CustomEvent) => {
      const photoId = event.detail;
      // Validate photoId is a safe string before navigating
      if (typeof photoId === 'string' && /^[\w-]+$/.test(photoId)) {
        this.router.navigate(['/hub', photoId]);
      }
    }) as EventListener;
    window.addEventListener('navigateToPhoto', this.navigationHandler);

    this.updateMarkers();
  }

  ngOnDestroy(): void {
    // Clean up event listener to prevent memory leaks
    if (this.navigationHandler) {
      window.removeEventListener('navigateToPhoto', this.navigationHandler);
    }
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

        // Sanitize photo data for safe HTML interpolation
        const safeId = this.escapeHtml(photo.id);
        const safeTitle = this.escapeHtml(photo.title);
        const safeLocation = this.escapeHtml(photo.location.name);

        m.bindPopup(`
          <div style="text-align: center; min-width: 150px;">
            <h4 style="margin: 0 0 8px; color: #e65100;">${safeTitle}</h4>
            <p style="margin: 0 0 8px; font-size: 0.875rem; color: #616161;">${safeLocation}</p>
            <button onclick="window.dispatchEvent(new CustomEvent('navigateToPhoto', {detail: '${safeId}'}))" 
                    style="background: #ff9800; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
              View Photo
            </button>
          </div>
        `);

        return m;
      });

    this.markers.set(newMarkers);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
