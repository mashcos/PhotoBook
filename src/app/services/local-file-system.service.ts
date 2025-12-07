import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Photo, Category, LocationData } from '../models/models';
import { DataProvider } from './data-provider.interface';
import EXIF from 'exif-js';

/**
 * Represents a file handle from the File System Access API
 */
interface FileSystemFileHandle {
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
  name: string;
}

interface FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | Blob | ArrayBuffer): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

/**
 * LocalFileSystemService implements File System Access API
 * for selecting local directories, scanning images, and extracting EXIF data
 */
@Injectable({
  providedIn: 'root',
})
export class LocalFileSystemService implements DataProvider {
  private directoryHandle?: FileSystemDirectoryHandle;

  // Use BehaviorSubjects to hold state and emit updates
  private photosSubject = new BehaviorSubject<Photo[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);

  /**
   * Check if File System Access API is supported
   */
  isSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  /**
   * Select a local directory using File System Access API
   */
  async selectDirectory(): Promise<boolean> {
    if (!this.isSupported()) {
      console.error('File System Access API is not supported');
      return false;
    }

    try {
      this.directoryHandle = await window.showDirectoryPicker();
      return true;
    } catch (error) {
      console.error('Failed to select directory:', error);
      return false;
    }
  }

  /**
   * Scan the selected directory for images and merge with existing photos
   */
  async scanForImages(): Promise<Photo[]> {
    if (!this.directoryHandle) {
      console.error('No directory selected');
      return [];
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const currentPhotos = this.photosSubject.value; // Get current value
    const existingPhotosMap = new Map(currentPhotos.map(p => {
      // Create a key based on filename to identify duplicates
      const filename = p.src.split('/').pop() || '';
      return [filename, p];
    }));

    const newPhotos: Photo[] = [];

    try {
      for await (const entry of this.directoryHandle.values()) {
        if (entry.kind === 'file') {
          const extension = entry.name.toLowerCase().slice(entry.name.lastIndexOf('.'));
          if (imageExtensions.includes(extension)) {
            // Check if we already have this photo
            if (existingPhotosMap.has(entry.name)) {
              continue;
            }

            const fileHandle = entry as unknown as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            const photo = await this.createPhotoFromFile(file);
            newPhotos.push(photo);
          }
        }
      }

      // Merge new photos into the existing list and emit
      const updatedPhotos = [...currentPhotos, ...newPhotos];
      this.photosSubject.next(updatedPhotos);
      return updatedPhotos;
    } catch (error) {
      console.error('Failed to scan directory:', error);
      return currentPhotos;
    }
  }

  /**
   * Generate a unique ID for a photo
   */
  private generateUniqueId(): string {
    // Use crypto.randomUUID if available, otherwise fallback to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `photo-${crypto.randomUUID()}`;
    }
    // Fallback with more entropy
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 11);
    const random2 = Math.random().toString(36).substring(2, 11);
    return `photo-${timestamp}-${random1}${random2}`;
  }

  /**
   * Create a Photo object from a File, extracting EXIF data
   */
  private async createPhotoFromFile(file: File): Promise<Photo> {
    const id = this.generateUniqueId();
    const src = "assets/local/" + file.name;
    const exifData = await this.extractExifData(file);

    return {
      id,
      src,
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      date: exifData.date || parseWhatsappDate(file.name) || new Date(file.lastModified).toISOString(),
      location: exifData.location || { name: '', lat: 0, lng: 0 },
      categoryIds: [],
      isPrivacyProtected: false,
    };
  }

  /**
   * Extract EXIF data from an image file
   */
  private extractExifData(file: File): Promise<{ date?: string; location?: LocationData }> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        try {
          // Type assertion for EXIF.js
          const exifObj = EXIF as {
            readFromBinaryFile(data: ArrayBuffer): ExifTags | null;
          };

          interface ExifTags {
            DateTimeOriginal?: string;
            DateTime?: string;
            GPSLatitude?: number[];
            GPSLongitude?: number[];
            GPSLatitudeRef?: string;
            GPSLongitudeRef?: string;
          }

          const tags = exifObj.readFromBinaryFile(arrayBuffer) as ExifTags | null;

          if (tags) {
            const result: { date?: string; location?: LocationData } = {};

            // Extract date
            if (tags.DateTimeOriginal || tags.DateTime) {
              const dateStr = tags.DateTimeOriginal || tags.DateTime;
              if (dateStr) {
                // EXIF date format: "YYYY:MM:DD HH:MM:SS"
                const [datePart, timePart] = dateStr.split(' ');
                const isoDate = `${datePart.replace(/:/g, '-')}T${timePart || '00:00:00'}Z`;
                result.date = isoDate;
              }
            }

            // Extract GPS coordinates
            if (tags.GPSLatitude && tags.GPSLongitude) {
              const lat = this.convertDMSToDD(
                tags.GPSLatitude,
                tags.GPSLatitudeRef || 'N'
              );
              const lng = this.convertDMSToDD(
                tags.GPSLongitude,
                tags.GPSLongitudeRef || 'E'
              );

              result.location = {
                name: '',
                lat,
                lng,
              };
            }

            resolve(result);
          } else {
            resolve({});
          }
        } catch {
          resolve({});
        }
      };

      reader.onerror = () => resolve({});
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convert DMS (Degrees, Minutes, Seconds) to Decimal Degrees
   */
  private convertDMSToDD(dms: number[], ref: string): number {
    if (!dms || dms.length < 3) return 0;

    const degrees = dms[0];
    const minutes = dms[1];
    const seconds = dms[2];

    let dd = degrees + minutes / 60 + seconds / 3600;

    if (ref === 'S' || ref === 'W') {
      dd = -dd;
    }

    return dd;
  }

  /**
   * Get all photos
   */
  getPhotos(): Observable<Photo[]> {
    return this.photosSubject.asObservable();
  }

  /**
   * Get all categories
   */
  getCategories(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  /**
   * Get a photo by ID
   */
  getPhotoById(id: string): Observable<Photo | undefined> {
    return this.photosSubject.pipe(
      map(photos => photos.find(p => p.id === id))
    );
  }

  /**
   * Get photos by category
   */
  getPhotosByCategory(categoryId: string): Observable<Photo[]> {
    return this.photosSubject.pipe(
      map(photos => photos.filter(p => p.categoryIds.includes(categoryId)))
    );
  }

  /**
   * Save photos to a JSON file in the selected directory
   */
  savePhotos(photos: Photo[]): Observable<boolean> {
    if (!this.directoryHandle) {
      return of(false);
    }

    return from(this.saveJsonFile('photos.json', photos)).pipe(
      map(() => {
        this.photosSubject.next(photos);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Save categories to a JSON file in the selected directory
   */
  saveCategories(categories: Category[]): Observable<boolean> {
    if (!this.directoryHandle) {
      return of(false);
    }

    return from(this.saveJsonFile('categories.json', categories)).pipe(
      map(() => {
        this.categoriesSubject.next(categories);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Save JSON data to a file in the selected directory
   */
  private async saveJsonFile(filename: string, data: unknown): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected');
    }

    const fileHandle = await this.directoryHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  /**
   * Load photos from a JSON file in the selected directory
   */
  async loadPhotosFromDirectory(): Promise<Photo[]> {
    if (!this.directoryHandle) {
      return [];
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle('photos.json');
      const file = await fileHandle.getFile();
      const text = await file.text();
      const photos = JSON.parse(text);
      this.photosSubject.next(photos);
      return photos;
    } catch {
      return [];
    }
  }

  /**
   * Load categories from a JSON file in the selected directory
   */
  async loadCategoriesFromDirectory(): Promise<Category[]> {
    if (!this.directoryHandle) {
      return [];
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle('categories.json');
      const file = await fileHandle.getFile();
      const text = await file.text();
      const categories = JSON.parse(text);
      this.categoriesSubject.next(categories);
      return categories;
    } catch {
      return [];
    }
  }
}

function parseWhatsappDate(name: string): string | null {
  if (name.match(/^IMG-\d{8}-WA\d+/)) {
    const datePart = name.substring(4, 12);
    const year = datePart.substring(0, 4);
    const month = datePart.substring(4, 6);
    const day = datePart.substring(6, 8);
    return `${year}-${month}-${day}T00:00:00Z`;
  }
  return null;
}

