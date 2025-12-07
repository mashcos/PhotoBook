import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { LocalFileSystemService } from '../../services/local-file-system.service';


import { Photo, Category, LocationData } from '../../models/models';
import { MapSelectorComponent } from './map-selector/map-selector.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    DatePickerModule,
    MultiSelectModule,
    InputNumberModule,
    TextareaModule,
    RippleModule,
    DialogModule,
    TooltipModule,
    SelectModule,
    MapSelectorComponent,
  ],
  providers: [MessageService],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private readonly photoService = inject(LocalFileSystemService);
  private readonly messageService = inject(MessageService);

  protected readonly photos = toSignal(this.photoService.getPhotos(), {
    initialValue: [] as Photo[],
  });

  protected readonly categories = toSignal(this.photoService.getCategories(), {
    initialValue: [] as Category[],
  });

  protected readonly editablePhotos = signal<Photo[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly selectedPhotos = signal<Photo[]>([]);

  // Map Selector State
  protected readonly isMapSelectorVisible = signal(false);
  protected readonly currentEditingPhotoId = signal<string | null>(null);
  protected readonly initialMapLocation = signal<LocationData | undefined>(undefined);

  protected readonly hasUnsavedChanges = computed(() => {
    // This is a simplified check. Ideally we'd compare deep equality with original photos.
    // For now, we rely on the user to save.
    // We could implement a dirty flag if needed.
    return false; // Placeholder, as tracking deep changes is complex. Use indicators instead.
  });

  expandedRows = {};

  constructor() {
    // Initialize editable photos when photos load
    this.photoService.getPhotos().subscribe((photos) => {
      this.editablePhotos.set(photos.map((p) => ({ ...p })));
    });
  }

  async selectDirectory(): Promise<void> {
    this.isLoading.set(true);
    const success = await this.photoService.selectDirectory();
    if (success) {
      const photos = await this.photoService.scanForImages();
      if (photos.length > 0) {
        this.editablePhotos.set(photos);
        this.messageService.add({
          severity: 'success',
          summary: 'Directory Selected',
          detail: `Found ${photos.length} images`,
        });
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'No Images Found',
          detail: 'The selected directory contains no supported images',
        });
      }
    }
    this.isLoading.set(false);
  }

  async saveToFile(): Promise<void> {
    this.isLoading.set(true);
    this.photoService.savePhotos(this.editablePhotos()).subscribe({
      next: (success) => {
        if (success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Saved',
            detail: 'Photos saved to photos.json',
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select a directory first',
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save photos',
        });
        this.isLoading.set(false);
      },
    });
  }

  clonedPhotos: { [s: string]: any } = {};

  onRowExpand(event: any): void {
    const photo = event.data as Photo;
    this.clonedPhotos[photo.id] = {
      ...photo,
      location: { ...photo.location },
      dateObj: new Date(photo.date),
      categoryIds: [...photo.categoryIds],
    };
  }

  onRowCollapse(event: any): void {
    const photo = event.data as Photo;
    delete this.clonedPhotos[photo.id];
  }

  onRowEditSave(photo: Photo): void {
    const clone = this.clonedPhotos[photo.id];
    if (clone) {
      const updatedPhoto: Photo = {
        ...clone,
        date: clone.dateObj ? clone.dateObj.toISOString() : clone.date,
      };
      // Remove auxiliary properties if any
      delete (updatedPhoto as any).dateObj;

      this.updatePhotoInList(updatedPhoto);
      this.messageService.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Photo updated (save to file to persist)',
      });
    }
  }

  onRowEditCancel(photo: Photo): void {
    const photos = this.editablePhotos();
    const original = photos.find((p) => p.id === photo.id);
    if (original) {
      this.clonedPhotos[photo.id] = {
        ...original,
        location: { ...original.location },
        dateObj: new Date(original.date),
        categoryIds: [...original.categoryIds],
      };
    }
  }

  // --- Map Selector ---

  openMapSelector(photo: Photo): void {
    // If we are in edit mode (expanded row), use the cloned/editing data
    // Otherwise use the photo data
    const editingData = this.clonedPhotos[photo.id];
    const initialLoc = editingData ? editingData.location : photo.location;

    this.currentEditingPhotoId.set(photo.id);
    this.initialMapLocation.set(initialLoc);
    this.isMapSelectorVisible.set(true);
  }

  onLocationSelected(location: LocationData): void {
    const photoId = this.currentEditingPhotoId();
    if (photoId) {
      // Update cloned data if editing
      if (this.clonedPhotos[photoId]) {
        this.clonedPhotos[photoId].location = location;
      }

      // Also update the main list if not in edit mode (direct update? maybe safer to only allow in edit)
      // For smooth UX, let's update the main list too so the preview updates
      const photos = this.editablePhotos();
      const photo = photos.find(p => p.id === photoId);
      if (photo) {
        const updatedPhoto = { ...photo, location };
        this.updatePhotoInList(updatedPhoto);
      }
    }
    this.isMapSelectorVisible.set(false);
  }

  // --- Bulk Actions ---

  bulkCategory: string | null = null;
  bulkLocationName: string | null = null;

  applyBulkCategory(): void {
    if (!this.bulkCategory || this.selectedPhotos().length === 0) return;

    const currentPhotos = this.editablePhotos();
    const selectedIds = this.selectedPhotos().map(p => p.id);

    const newPhotos = currentPhotos.map(p => {
      if (selectedIds.includes(p.id)) {
        // Add category if not present
        if (!p.categoryIds.includes(this.bulkCategory!)) {
          return { ...p, categoryIds: [...p.categoryIds, this.bulkCategory!] };
        }
      }
      return p;
    });

    this.editablePhotos.set(newPhotos);
    this.messageService.add({
      severity: 'success',
      summary: 'Bulk Update',
      detail: `Added category to ${selectedIds.length} photos`,
    });

    // Clear selection
    this.selectedPhotos.set([]);
    this.bulkCategory = null;
  }

  applyBulkLocationName(): void {
    if (!this.bulkLocationName || this.selectedPhotos().length === 0) return;

    const currentPhotos = this.editablePhotos();
    const selectedIds = this.selectedPhotos().map(p => p.id);

    const newPhotos = currentPhotos.map(p => {
      if (selectedIds.includes(p.id)) {
        return {
          ...p,
          location: { ...p.location, name: this.bulkLocationName! }
        };
      }
      return p;
    });

    this.editablePhotos.set(newPhotos);
    this.messageService.add({
      severity: 'success',
      summary: 'Bulk Update',
      detail: `Updated location name for ${selectedIds.length} photos`,
    });

    // Clear selection
    this.selectedPhotos.set([]);
    this.bulkLocationName = null;
  }

  // --- Helpers ---

  private updatePhotoInList(updatedPhoto: Photo): void {
    const photos = this.editablePhotos();
    const index = photos.findIndex((p) => p.id === updatedPhoto.id);
    if (index !== -1) {
      const newPhotos = [...photos];
      newPhotos[index] = updatedPhoto;
      this.editablePhotos.set(newPhotos);
    }
  }

  getCategoryLabel(id: string): string {
    const cat = this.categories().find((c) => c.id === id);
    return cat ? cat.label : id;
  }

  isFileSystemSupported(): boolean {
    return this.photoService.isSupported();
  }
}
