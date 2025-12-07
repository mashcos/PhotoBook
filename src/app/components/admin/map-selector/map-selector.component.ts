import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import {
    latLng,
    tileLayer,
    MapOptions,
    Map,
    marker,
    Marker,
    icon,
    LeafletMouseEvent,
    Icon,
} from 'leaflet';
import { LocationData } from '../../../models/models';
import { ButtonModule } from 'primeng/button';

// Fix for default marker icons in Leaflet
Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
    selector: 'app-map-selector',
    standalone: true,
    imports: [LeafletModule, ButtonModule],
    templateUrl: './map-selector.html',
    styleUrl: './map-selector.scss',
})
export class MapSelectorComponent {
    @Input() set initialLocation(loc: LocationData | undefined) {
        if (loc && loc.lat && loc.lng) {
            this.currentCenter = latLng(loc.lat, loc.lng);
            this.currentZoom = 13;
            this.updateMarker(loc.lat, loc.lng);
        } else {
            // Default to Germany center if no location
            this.currentCenter = latLng(51.1657, 10.4515);
            this.currentZoom = 6;
            this.currentMarker.set(undefined);
        }
    }

    @Output() locationSelected = new EventEmitter<LocationData>();
    @Output() cancel = new EventEmitter<void>();

    // Map state
    protected currentCenter = latLng(51.1657, 10.4515);
    protected currentZoom = 6;
    protected currentMarker = signal<Marker | undefined>(undefined);

    protected readonly mapOptions: MapOptions = {
        layers: [
            tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }),
        ],
        zoom: 6,
        center: latLng(51.1657, 10.4515),
    };

    onMapReady(map: Map): void {
        // Invalidate size after a short delay to ensure map renders correctly in dialog
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }

    onMapClick(event: LeafletMouseEvent): void {
        const { lat, lng } = event.latlng;
        this.updateMarker(lat, lng);
    }

    private updateMarker(lat: number, lng: number): void {
        const newMarker = marker([lat, lng], {
            icon: icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl:
                    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl:
                    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            }),
        });
        this.currentMarker.set(newMarker);
    }

    confirmSelection(): void {
        const m = this.currentMarker();
        if (m) {
            const { lat, lng } = m.getLatLng();
            this.locationSelected.emit({
                name: '', // Determine name via geocoding later if possible
                lat,
                lng,
            });
        }
    }
}
