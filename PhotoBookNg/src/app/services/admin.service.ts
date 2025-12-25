import { Injectable, inject } from '@angular/core';
import { Observable, map, of, shareReplay, catchError, from } from 'rxjs';
import { createPhotoBookClient, PhotoBookClient } from '../client/photoBookClient';
import {
  CategoryRequest,
  CategorySummary,
  CategoryViewModel,
  LocationRequest,
  LocationSummary,
  PhotoRequest,
  PhotoSummary,
  PhotoViewModel,
} from '../client/models';
import { TenantService } from './tenant.service';
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AdminAuthenticationProvider } from './admin-auth-provider';

/**
 * PhotoService handles loading data via API
 */
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  protected tenantService = inject(TenantService);
  protected oidcSecurityService = inject(OidcSecurityService); // <--- Injecten
  private client: PhotoBookClient;

  constructor() {
    const authProvider = new AdminAuthenticationProvider(this.oidcSecurityService);
    const adapter = new FetchRequestAdapter(authProvider);

    // Use relative API base so the dev-server proxy forwards to backend
    adapter.baseUrl = '';

    this.client = createPhotoBookClient(adapter);
  }

  getPhotos(): Observable<PhotoSummary[]> {
    const request: PhotoRequest = {};
    const photos$ = from(this.client.api.photo.request.post(request)).pipe(
      map((photos) => photos ?? []),
      shareReplay(1),
      catchError(() => of([])),
    );
    return photos$;
  }

  getCategories(): Observable<CategorySummary[]> {
    const request: CategoryRequest = {};
    const categories$ = from(this.client.api.category.request.post(request)).pipe(
      map((categories) => categories ?? []),
      shareReplay(1),
      catchError(() => of([])),
    );
    return categories$;
  }

  getLocations(): Observable<LocationSummary[]> {
    const request: LocationRequest = {};
    const locations$ = from(this.client.api.location.request.post(request)).pipe(
      map((locations) => locations ?? []),
      shareReplay(1),
      catchError(() => of([])),
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
      catchError(() => of([])),
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
