import { Component, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { latLng, tileLayer, MapOptions, marker, Marker, icon, Icon } from 'leaflet';
import { PhotoService } from '../../services/photo.service';
import { Photo, Location } from '../../models/models';
import { LocationSummary, PhotoSummary } from '../../client/models';

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
    initialValue: [] as PhotoSummary[],
  });

  protected readonly locations = toSignal(this.photoService.getLocations(), {
    initialValue: [] as LocationSummary[],
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

  constructor() {
    // Reactive effect to update markers whenever photos or locations change
    effect(() => {
      this.updateMarkers();
    });
  }

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

    // Use effect for reactive updates instead of initial call
    // this.updateMarkers();
  }

  ngOnDestroy(): void {
    // Clean up event listener to prevent memory leaks
    if (this.navigationHandler) {
      window.removeEventListener('navigateToPhoto', this.navigationHandler);
    }
  }

  private updateMarkers(): void {
    const photos = this.photos();
    const markers: Marker[] = [];

    for (const photo of photos) {
      if (!photo.locationId) continue;

      const loc = this.locations().find((l) => l.id === photo.locationId);
      const lat = loc?.latitude ?? 0;
      const lng = loc?.longitude ?? 0;

      if (lat === 0 && lng === 0) continue;

      const name = loc!.locationName;

      const m = marker([lat, lng], {
        title: photo.title ?? undefined,
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

      const safeId = this.escapeHtml(photo.id!);
      const safeTitle = this.escapeHtml(photo.title ?? "");
      const safeLocation = this.escapeHtml(name ?? "");

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

      markers.push(m);
    }

    this.markers.set(markers);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
