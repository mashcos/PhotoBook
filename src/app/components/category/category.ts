import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PhotoService } from '../../services/photo.service';
import { Photo, Category as CategoryModel } from '../../models/models';

@Component({
  selector: 'app-category',
  imports: [RouterLink, ButtonModule, TagModule],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class CategoryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly photoService = inject(PhotoService);

  protected readonly categoryId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') || ''))
  );

  protected readonly category = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id') || '';
        return this.photoService.getCategories().pipe(
          map((categories) => categories.find((c) => c.id === id))
        );
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
    { initialValue: [] as Photo[] }
  );

  protected readonly categories = toSignal(this.photoService.getCategories(), {
    initialValue: [] as CategoryModel[],
  });

  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
