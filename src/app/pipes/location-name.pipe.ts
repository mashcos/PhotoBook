import { Pipe, PipeTransform } from '@angular/core';
import { Photo, Location } from '../models/models';

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
