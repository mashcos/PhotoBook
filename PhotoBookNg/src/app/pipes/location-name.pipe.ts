import { Pipe, PipeTransform } from '@angular/core';
import { Photo, Location } from '../models/models';
import { LocationSummary, PhotoSummary } from '../client/models';

@Pipe({
    name: 'locationName',
    standalone: true,
    pure: true
})
export class LocationNamePipe implements PipeTransform {
    transform(photo: Photo, locations: Location[] | null): string {
        if (photo.locationId && locations) {
            const loc = locations.find(l => l.id === photo.locationId);
            if (loc) {
                return loc.name;
            }
        }
        return '';
    }
}


@Pipe({
    name: 'locationSummaryName',
    standalone: true,
    pure: true
})
export class LocationSummaryNamePipe implements PipeTransform {
    transform(photo: PhotoSummary, locations: LocationSummary[] | null): string {
        if (photo.locationId && locations) {
            const loc = locations.find(l => l.id === photo.locationId);
            if (loc) {
                return loc.locationName!;
            }
        }
        return '';
    }
}
