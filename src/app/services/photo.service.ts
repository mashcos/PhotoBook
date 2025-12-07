import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, shareReplay, catchError } from 'rxjs';
import { Photo, Category, Location } from '../models/models';
import { DataProvider } from './data-provider.interface';

/**
 * PhotoService handles loading photos.json and categories.json via HTTP
 * Implements DataProvider interface for server mode
 */
@Injectable({
  providedIn: 'root',
})
export class PhotoService implements DataProvider {
  private readonly http = inject(HttpClient);

  private readonly photosUrl = 'assets/local/photos.json';
  private readonly categoriesUrl = 'assets/local/categories.json';

  // Cache the observables for reuse
  private photos$?: Observable<Photo[]>;
  private categories$?: Observable<Category[]>;

  /**
   * Load all photos from the JSON file
   */
  getPhotos(): Observable<Photo[]> {
    if (!this.photos$) {
      this.photos$ = this.http.get<Photo[]>(this.photosUrl).pipe(
        shareReplay(1),
        catchError(() => of([]))
      );
    }
    return this.photos$;
  }

  /**
   * Load all categories from the JSON file
   */
  getCategories(): Observable<Category[]> {
    if (!this.categories$) {
      this.categories$ = this.http.get<Category[]>(this.categoriesUrl).pipe(
        shareReplay(1),
        catchError(() => of([]))
      );
    }
    return this.categories$;
  }

  /**
   * Get a single photo by ID
   */
  getPhotoById(id: string): Observable<Photo | undefined> {
    return this.getPhotos().pipe(map((photos) => photos.find((p) => p.id === id)));
  }

  /**
   * Get photos by category ID
   */
  getPhotosByCategory(categoryId: string): Observable<Photo[]> {
    return this.getPhotos().pipe(
      map((photos) => photos.filter((p) => p.categoryIds.includes(categoryId)))
    );
  }

  /**
   * Save photos - not implemented for HTTP mode
   */
  savePhotos(_photos: Photo[]): Observable<boolean> {
    console.warn('PhotoService: savePhotos is not supported in HTTP mode');
    return of(false);
  }

  /**
   * Save categories - not implemented for HTTP mode
   */
  saveCategories(_categories: Category[]): Observable<boolean> {
    console.warn('PhotoService: saveCategories is not supported in HTTP mode');
    return of(false);
  }

  /**
   * Clear the cache to force reload
   */
  clearCache(): void {
    this.photos$ = undefined;
    this.categories$ = undefined;
    this.locations$ = undefined;
  }

  // --- Locations ---
  private readonly locationsUrl = 'assets/local/locations.json';
  private locations$?: Observable<Location[]>;

  getLocations(): Observable<Location[]> {
    if (!this.locations$) {
      this.locations$ = this.http.get<Location[]>(this.locationsUrl).pipe(
        shareReplay(1),
        catchError(() => of([]))
      );
    }
    return this.locations$;
  }

  saveLocations(_locations: Location[]): Observable<boolean> {
    console.warn('PhotoService: saveLocations is not supported in HTTP mode');
    return of(false);
  }
}
