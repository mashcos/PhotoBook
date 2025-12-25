import { Pipe, PipeTransform } from '@angular/core';
import { LocationSummary, PhotoSummary } from '../client/models';

@Pipe({
    name: 'locationName',
    standalone: true,
    pure: true
})
export class LocationNamePipe implements PipeTransform {
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
