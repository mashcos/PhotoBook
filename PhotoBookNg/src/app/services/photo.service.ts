import { Injectable, inject } from '@angular/core';
import { Observable, map, of, shareReplay, catchError, from } from 'rxjs';
import { Photo, Category, Location } from '../models/models';
import { PhotoBookClient } from '../client/photoBookClient';
import { PHOTO_BOOK_CLIENT } from '../app.config';
import { CategoryRequest, CategorySummary, CategoryViewModel, LocationRequest, LocationSummary, PhotoRequest, PhotoSummary, PhotoViewModel } from '../client/models';

/**
 * PhotoService handles loading data via API
 */
@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private client = inject<PhotoBookClient>(PHOTO_BOOK_CLIENT);

  getPhotos(): Observable<PhotoSummary[]> {
    const request: PhotoRequest = {};
    const photos$ = from(this.client.api.photo.request.post(request)).pipe(
      map((photos) => photos ?? []),
      shareReplay(1),
      catchError(() => of([]))
    );
    return photos$;
  }

  getCategories(): Observable<CategorySummary[]> {
    const request: CategoryRequest = {};
    const categories$ = from(this.client.api.category.request.post(request)).pipe(
      map((categories) => categories ?? []),
      shareReplay(1),
      catchError(() => of([]))
    );
    return categories$;
  }

  getLocations(): Observable<LocationSummary[]> {
    const request: LocationRequest = {};
    const locations$ = from(this.client.api.location.request.post(request)).pipe(
      map((locations) => locations ?? []),
      shareReplay(1),
      catchError(() => of([]))
    );
    return locations$;
  }

  /**
   * Get a single photo by ID
   */
  getPhotoById(id: string): Observable<PhotoViewModel | undefined> {
    return from(this.client.api.photo.byId(id).get());
  }

  /**
   * Get photos by category ID
   */
  getPhotosByCategory(categoryId: string): Observable<PhotoSummary[]> {
    const request: PhotoRequest = {
      categoryId: categoryId,
    };
    const photos$ = from(this.client.api.photo.request.post(request)).pipe(
      map((photos) => photos ?? []),
      shareReplay(1),
      catchError(() => of([]))
    );
    return photos$;
  }

  /**
   * Get a single photo by ID
   */
  getCategoryById(id: string): Observable<CategoryViewModel | undefined> {
    return from(this.client.api.category.byId(id).get());
  }

  getLocationById(id: string): Observable<LocationSummary | undefined> {
    return from(this.client.api.location.byId(id).get());
  }
}