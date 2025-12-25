import { Component, EventEmitter, Input, Output, signal, effect } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
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
import { ButtonModule } from 'primeng/button';
import { LocationSummary } from '../../../client/models';

// Fix for default marker icons in Leaflet
Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
    selector: 'app-map-selector',
    standalone: true,
    imports: [LeafletModule, ButtonModule, FormsModule, InputTextModule, CheckboxModule],
    templateUrl: './map-selector.html',
    styleUrl: './map-selector.scss',
})
export class MapSelectorComponent {
    @Input() set initialLocation(loc: LocationSummary | undefined) {
        if (loc) {
            if (loc.latitude && loc.longitude) {
                this.currentCenter = latLng(loc.latitude, loc.longitude);
                this.currentZoom = 13;
                this.updateMarker(loc.latitude, loc.longitude);
            }
            this.locationName.set(loc.locationName || '');
            // TODO this.isReuseLocation.set(loc.isReuseLocation || false);
            this.originalLocationId = loc.id ?? undefined;
        } else {
            // Default to Germany center if no location
            this.currentCenter = latLng(51.1657, 10.4515);
            this.currentZoom = 6;
            this.currentMarker.set(undefined);
            this.locationName.set('');
            this.isReuseLocation.set(false);
            this.originalLocationId = undefined;
        }
    }

    @Output() save = new EventEmitter<{ mode: 'create' | 'update'; location: LocationSummary }>();
    @Output() cancel = new EventEmitter<void>();

    // Form State
    protected readonly locationName = signal('');
    protected readonly isReuseLocation = signal(false);
    protected originalLocationId: string | undefined;

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

    onSave(mode: 'create' | 'update'): void {
        const m = this.currentMarker();
        if (m) {
            const { lat, lng } = m.getLatLng();

            // Should we block if name is empty? Maybe for reusable locations?
            // For now allowing empty names as per previous behavior, but usually name is desired.

            const location: LocationSummary = {
                id: mode === 'update' && this.originalLocationId ? this.originalLocationId : crypto.randomUUID(),
                locationName: this.locationName(),
                latitude: lat,
                longitude: lng,
                // TODO isReuseLocation: this.isReuseLocation(),
            };

            this.save.emit({ mode, location });
        }
    }

    onSearchName(): void {
        console.log('Search Name clicked');
        // Placeholder for future geocoding reverse lookup
    }

    onSearchLocation(): void {
        console.log('Search Location clicked');
        // Placeholder for future geocoding lookup
    }
}
