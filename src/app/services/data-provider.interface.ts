import { Observable } from 'rxjs';
import { Photo, Category } from '../models/models';

/**
 * DataProvider interface to switch between Server-Mode (HTTP) and Local-Dev-Mode (File System)
 */
export interface DataProvider {
  /**
   * Load all photos
   */
  getPhotos(): Observable<Photo[]>;

  /**
   * Load all categories
   */
  getCategories(): Observable<Category[]>;

  /**
   * Get a single photo by ID
   */
  getPhotoById(id: string): Observable<Photo | undefined>;

  /**
   * Get photos by category ID
   */
  getPhotosByCategory(categoryId: string): Observable<Photo[]>;

  /**
   * Save photos (for local mode)
   */
  savePhotos(photos: Photo[]): Observable<boolean>;

  /**
   * Save categories (for local mode)
   */
  saveCategories(categories: Category[]): Observable<boolean>;
}
