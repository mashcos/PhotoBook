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


import { Photo, Category, Location } from '../../models/models';
import { MapSelectorComponent } from './map-selector/map-selector.component';
import { LocationNamePipe } from '../../pipes/location-name.pipe';

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
    LocationNamePipe,
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

  protected readonly locations = toSignal(this.photoService.getLocations(), {
    initialValue: [] as Location[],
  });

  protected readonly reusableLocations = computed(() =>
    this.locations().filter(l => l.isReuseLocation)
  );

  protected readonly editablePhotos = signal<Photo[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly selectedPhotos = signal<Photo[]>([]);

  // Map Selector State
  protected readonly isMapSelectorVisible = signal(false);
  protected readonly currentEditingPhotoId = signal<string | null>(null);
  protected readonly initialMapLocation = signal<Location | undefined>(undefined);

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
      // Load existing data first
      await this.photoService.loadCategoriesFromDirectory();
      await this.photoService.loadPhotosFromDirectory();
      await this.photoService.loadLocationsFromDirectory();

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
      // location: { ...photo.location }, // Removed direct location access
      locationId: photo.locationId,
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
        // location: { ...original.location }, // Removed direct location access
        locationId: original.locationId,
        dateObj: new Date(original.date),
        categoryIds: [...original.categoryIds],
      };
    }
  }

  // --- Map Selector ---

  openMapSelector(photo: Photo): void {
    // If we are in edit mode (expanded row), use the cloned/editing data
    // otherwise use the photo data.
    const editingData = this.clonedPhotos[photo.id];
    const targetPhoto = editingData || photo;

    // Resolve location
    let initialLoc: Location | undefined;
    if (targetPhoto.locationId) {
      const loc = this.locations().find(l => l.id === targetPhoto.locationId);
      if (loc) {
        initialLoc = loc;
      }
    }

    this.currentEditingPhotoId.set(photo.id);
    this.initialMapLocation.set(initialLoc);
    this.isMapSelectorVisible.set(true);
  }

  onMapSave(event: { mode: 'create' | 'update'; location: Location }): void {
    const { mode, location } = event;
    const photoId = this.currentEditingPhotoId();

    if (mode === 'create') {
      const currentLocs = this.locations();
      // Add new location to global list
      this.photoService.saveLocations([...currentLocs, location]).subscribe(success => {
        if (success) {
          this.messageService.add({ severity: 'success', summary: 'Location Created', detail: 'New location created' });

          // Link photo to new location
          if (photoId) {
            if (this.clonedPhotos[photoId]) {
              this.clonedPhotos[photoId].locationId = location.id;
              // photo.isReuseLocation is deprecated/derived, but if we need it:
              // this.clonedPhotos[photoId].isReuseLocation = location.isReuseLocation; 
            }
            const photos = this.editablePhotos();
            const photo = photos.find(p => p.id === photoId);
            if (photo) {
              const updatedPhoto = { ...photo, locationId: location.id };
              this.updatePhotoInList(updatedPhoto);
            }
          }
        }
      });
    } else if (mode === 'update') {
      // Update existing location
      const currentLocs = this.locations();
      const updatedLocs = currentLocs.map(l => l.id === location.id ? location : l);

      this.photoService.saveLocations(updatedLocs).subscribe(success => {
        if (success) {
          this.messageService.add({ severity: 'success', summary: 'Location Updated', detail: 'Shared location updated' });
          // Photo link remains same (locationId unchanged)
        }
      });
    }

    this.isMapSelectorVisible.set(false);
  }

  // --- Location Management ---

  async saveNewLocation(photo: any): Promise<void> {
    // In new model, we edit the location name potentially via a bound input to... what?
    // If the input was bound to `photo.location.name`, that's gone.
    // The template likely binds to a temporary field or we need to look up component state.

    // Assuming template will be updated to bind to a variable or we look up the location.
    // BUT, if we are editing a photo with a locationId, we are essentially renaming the referenced location?
    // OR we are creating a new reusable location from the current private one?

    if (!photo.locationId) return;

    const loc = this.locations().find(l => l.id === photo.locationId);
    if (!loc) return;

    // Convert current (private?) location to Reusable
    if (loc.isReuseLocation) {
      this.messageService.add({ severity: 'info', summary: 'Already Reusable', detail: 'This location is already reusable.' });
      return;
    }

    if (!loc.name) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Name', detail: 'Please enter a location name first' });
      return;
    }

    // Update to reusable
    const updatedLocation = { ...loc, isReuseLocation: true };
    const allLocations = this.locations().map(l => l.id === loc.id ? updatedLocation : l);

    this.photoService.saveLocations(allLocations).subscribe(success => {
      if (success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Location Saved',
          detail: 'Location marked as reusable'
        });

        // Update photo state if needed (it already refs the ID)
        photo.isReuseLocation = true; // This field on Photo might be redundant now? Yes.
      }
    });
  }

  onReusableLocationSelect(photoId: string, locationId: string): void {
    const location = this.locations().find(l => l.id === locationId);
    if (location && this.clonedPhotos[photoId]) {
      this.clonedPhotos[photoId].locationId = locationId;
      this.clonedPhotos[photoId].isReuseLocation = true;
    }
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

    // 1. Create a new single location for ALL these photos?
    //    If we give them all the same name, they are logically the same place?
    //    If they have different coordinates, we can't share a single Location object easily unless we average them (bad).
    //    OR we just update the name of their individual locations?

    // User expectation for "Bulk Location Name": "Set all these to 'Paris'".
    // If they have different coords, they are different 'Paris' locations?
    // OR we pick one coordinate?
    // Simpler: iterate, find their referenced location, update its name.

    // Problem: If they share location with UNSELECTED photos, we rename for them too?
    // Side effects!

    // For now: Iterate selected photos.
    // If photo has locationId -> Find Location -> Update Name -> Save Location.

    const locations = [...this.locations()];
    let updatedAny = false;

    const newPhotos = currentPhotos.map(p => {
      if (selectedIds.includes(p.id)) {
        if (p.locationId) {
          const locIndex = locations.findIndex(l => l.id === p.locationId);
          if (locIndex !== -1) {
            locations[locIndex] = { ...locations[locIndex], name: this.bulkLocationName! };
            updatedAny = true;
          }
        }
        return p;
      }
      return p;
    });

    if (updatedAny) {
      this.photoService.saveLocations(locations).subscribe();
    }

    this.editablePhotos.set(newPhotos);
    this.messageService.add({
      severity: 'success',
      summary: 'Bulk Update',
      detail: `Updated location names for selected photos`,
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
