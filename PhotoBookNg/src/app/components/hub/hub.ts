import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PhotoService } from '../../services/photo.service';
import { LocationSummary } from '../../client/models';
import { ImageSourcePipe } from '../../pipes/image-source.pipe';

@Component({
  selector: 'app-hub',
  imports: [RouterLink, ChipModule, ButtonModule, CardModule, ImageSourcePipe],
  templateUrl: './hub.html',
  styleUrl: './hub.scss',
})
export class Hub {
  private readonly route = inject(ActivatedRoute);
  private readonly photoService = inject(PhotoService);

  protected readonly photo = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id') || '';
        return this.photoService.getPhotoById(id);
      }),
    ),
  );

  protected formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  locationName(): string | undefined {
    const location = this.photo()?.location as LocationSummary | undefined;
    return location?.locationName ?? undefined;
  }
}
