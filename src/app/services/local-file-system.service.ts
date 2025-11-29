import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
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
  private photos: Photo[] = [];
  private categories: Category[] = [];

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
   * Scan the selected directory for images
   */
  async scanForImages(): Promise<Photo[]> {
    if (!this.directoryHandle) {
      console.error('No directory selected');
      return [];
    }

    const photos: Photo[] = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    try {
      for await (const entry of this.directoryHandle.values()) {
        if (entry.kind === 'file') {
          const extension = entry.name.toLowerCase().slice(entry.name.lastIndexOf('.'));
          if (imageExtensions.includes(extension)) {
            const fileHandle = entry as unknown as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            const photo = await this.createPhotoFromFile(file);
            photos.push(photo);
          }
        }
      }

      this.photos = photos;
      return photos;
    } catch (error) {
      console.error('Failed to scan directory:', error);
      return [];
    }
  }

  /**
   * Create a Photo object from a File, extracting EXIF data
   */
  private async createPhotoFromFile(file: File): Promise<Photo> {
    const id = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const src = URL.createObjectURL(file);
    const exifData = await this.extractExifData(file);

    return {
      id,
      src,
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      date: exifData.date || new Date(file.lastModified).toISOString(),
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
    return of(this.photos);
  }

  /**
   * Get all categories
   */
  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  /**
   * Get a photo by ID
   */
  getPhotoById(id: string): Observable<Photo | undefined> {
    return of(this.photos.find((p) => p.id === id));
  }

  /**
   * Get photos by category
   */
  getPhotosByCategory(categoryId: string): Observable<Photo[]> {
    return of(this.photos.filter((p) => p.categoryIds.includes(categoryId)));
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
        this.photos = photos;
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
        this.categories = categories;
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
      this.photos = JSON.parse(text);
      return this.photos;
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
      this.categories = JSON.parse(text);
      return this.categories;
    } catch {
      return [];
    }
  }
}
