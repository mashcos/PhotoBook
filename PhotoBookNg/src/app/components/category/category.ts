import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PhotoService } from '../../services/photo.service';
import { TenantService } from '../../services/tenant.service';
import { CategorySummary, LocationSummary, PhotoSummary } from '../../client/models';
import { LocationSummaryNamePipe } from '../../pipes/location-name.pipe';
import { ImageSourcePipe } from '../../pipes/image-source.pipe';

@Component({
  selector: 'app-category',
  imports: [RouterLink, ButtonModule, TagModule, LocationSummaryNamePipe, ImageSourcePipe],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class CategoryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly photoService = inject(PhotoService);
  protected readonly tenantService = inject(TenantService);

  protected readonly categoryId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') || ''))
  );

  protected readonly category = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id') || '';
        return this.photoService.getCategoryById(id).pipe();
      })
    )
  );

  protected readonly photos = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id') || '';
        return this.photoService.getPhotosByCategory(id);
      })
    ),
    { initialValue: [] as PhotoSummary[] }
  );

  protected readonly categories = toSignal(this.photoService.getCategories(), {
    initialValue: [] as CategorySummary[],
  });

  protected readonly locations = toSignal(this.photoService.getLocations(), {
    initialValue: [] as LocationSummary[],
  });

  protected formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
