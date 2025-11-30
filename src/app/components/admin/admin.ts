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
import { MessageService } from 'primeng/api';
import { LocalFileSystemService } from '../../services/local-file-system.service';
import { Photo, Category } from '../../models/models';

@Component({
  selector: 'app-admin',
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
  expandedRows: { [key: string]: boolean } = {};

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

      const photos = this.editablePhotos();
      const index = photos.findIndex((p) => p.id === photo.id);
      if (index !== -1) {
        const newPhotos = [...photos];
        newPhotos[index] = updatedPhoto;
        this.editablePhotos.set(newPhotos);

        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Photo updated (save to file to persist)',
        });
      }
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

  openMapSelector(photo: Photo): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Not Implemented',
      detail: 'Map selection will be implemented later',
    });
  }

  getCategoryLabel(id: string): string {
    const cat = this.categories().find((c) => c.id === id);
    return cat ? cat.label : id;
  }
  
  isFileSystemSupported(): boolean {
    return this.photoService.isSupported();
  }
}
