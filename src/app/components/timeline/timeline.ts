import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PhotoService } from '../../services/photo.service';
import { Photo, Location } from '../../models/models';
import { LocationNamePipe } from '../../pipes/location-name.pipe';

interface TimelineEvent {
  date: string;
  formattedDate: string;
  photos: Photo[];
}

@Component({
  selector: 'app-timeline',
  imports: [RouterLink, TimelineModule, CardModule, ButtonModule, LocationNamePipe],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline {
  private readonly photoService = inject(PhotoService);

  protected readonly photos = toSignal(this.photoService.getPhotos(), {
    initialValue: [] as Photo[],
  });

  protected readonly locations = toSignal(this.photoService.getLocations(), {
    initialValue: [] as Location[],
  });

  protected readonly groupedPhotos = computed<TimelineEvent[]>(() => {
    const photos = this.photos();
    const groups = new Map<string, Photo[]>();

    // Group by Year and Month
    for (const photo of photos) {
      const date = new Date(photo.date);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}`; // Key: "YYYY-MonthIndex"

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(photo);
    }

    // Convert Map to array and sort
    return Array.from(groups.entries())
      .map(([_, groupPhotos]) => {
        // Use the date from the first photo as the representative date for sorting/formatting
        const representativeDate = groupPhotos[0].date;
        return {
          date: representativeDate,
          formattedDate: this.formatDate(representativeDate),
          photos: groupPhotos
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  }
}
