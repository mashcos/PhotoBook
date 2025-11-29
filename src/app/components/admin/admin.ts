import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PhotoService } from '../../services/photo.service';
import { LocalFileSystemService } from '../../services/local-file-system.service';
import { Photo, Category } from '../../models/models';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, DatePipe, TableModule, ButtonModule, InputTextModule, CheckboxModule, ToastModule],
  providers: [MessageService],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private readonly photoService = inject(PhotoService);
  private readonly localFileService = inject(LocalFileSystemService);
  private readonly messageService = inject(MessageService);

  protected readonly photos = toSignal(this.photoService.getPhotos(), {
    initialValue: [] as Photo[],
  });

  protected readonly categories = toSignal(this.photoService.getCategories(), {
    initialValue: [] as Category[],
  });

  protected readonly editablePhotos = signal<Photo[]>([]);
  protected readonly isFileSystemSupported = signal(this.localFileService.isSupported());
  protected readonly isLoading = signal(false);

  constructor() {
    // Initialize editable photos when photos load
    this.photoService.getPhotos().subscribe((photos) => {
      this.editablePhotos.set(photos.map((p) => ({ ...p })));
    });
  }

  async selectDirectory(): Promise<void> {
    this.isLoading.set(true);
    const success = await this.localFileService.selectDirectory();
    if (success) {
      const photos = await this.localFileService.scanForImages();
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
    this.localFileService.savePhotos(this.editablePhotos()).subscribe({
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

  onRowEditInit(_photo: Photo): void {
    // Can be used to store original state for cancel
  }

  onRowEditSave(_photo: Photo): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Photo metadata updated (save to file to persist)',
    });
  }

  onRowEditCancel(_photo: Photo, _index: number): void {
    // Restore from original if needed
  }

  getCategoryLabel(id: string): string {
    const cat = this.categories().find((c) => c.id === id);
    return cat ? cat.label : id;
  }
}
