import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, combineLatest as combineLatestWith } from 'rxjs';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PhotoService } from '../../services/photo.service';
import { Photo, Category } from '../../models/models';

@Component({
  selector: 'app-hub',
  imports: [RouterLink, ChipModule, ButtonModule, CardModule],
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
      })
    )
  );

  protected readonly categories = toSignal(this.photoService.getCategories(), {
    initialValue: [] as Category[],
  });

  protected readonly photoCategories = computed(() => {
    const p = this.photo();
    const cats = this.categories();
    if (!p) return [];
    return cats.filter((c) => p.categoryIds.includes(c.id));
  });

  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
