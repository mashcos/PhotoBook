import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PhotoService } from '../../services/photo.service';
import { LocationSummary, PhotoSummary } from '../../client/models';
import { ImageSourcePipe } from '../../pipes/image-source.pipe';

interface TimelineEvent {
  date: string;
  formattedDate: string;
  photos: PhotoSummary[];
}

@Component({
  selector: 'app-timeline',
  imports: [RouterLink, TimelineModule, CardModule, ButtonModule, ImageSourcePipe],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline {
  private readonly photoService = inject(PhotoService);

  protected readonly photos = toSignal(this.photoService.getPhotos(), {
    initialValue: [] as PhotoSummary[],
  });

  protected readonly locations = toSignal(this.photoService.getLocations(), {
    initialValue: [] as LocationSummary[],
  });

  protected readonly groupedPhotos = computed<TimelineEvent[]>(() => {
    const photos = this.photos();
    const groups = new Map<string, PhotoSummary[]>();

    // Group by Year and Month
    for (const photo of photos) {
      const date = photo.takenOn!;
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
        const representativeDate = groupPhotos[0].takenOn!;
        return {
          date: representativeDate.toISOString(),
          formattedDate: this.formatDate(representativeDate),
          photos: groupPhotos
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  protected formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  }
}
