import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

import { AdminService } from '../../../../services/admin.service';
import { LocationSummary, CategorySummary, PhotoViewModel } from '../../../../client/models';
import { ImageSourcePipe } from "../../../../pipes/image-source.pipe";
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-admin-photo-detail',
  standalone: true,
  imports: [
    FormsModule,
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
    ImageSourcePipe
],
  providers: [MessageService],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class AdminPhotoDetailComponent {
cancel() {
throw new Error('Method not implemented.');
}
  private readonly route = inject(ActivatedRoute);
  private readonly adminService = inject(AdminService);

  photo: PhotoViewModel = {} as PhotoViewModel;

  constructor() {
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id') || '';
        return this.adminService.getPhotoById(id);
      }),
    ).subscribe(photo => {
      if (photo) {
        this.photo = photo;
      }
    });
  }

  protected readonly categories = toSignal(this.adminService.getCategories(), {
    initialValue: [] as CategorySummary[],
  });

  protected readonly locations = toSignal(this.adminService.getLocations(), {
    initialValue: [] as LocationSummary[],
  });

  protected readonly isLoading = signal(false);

  protected readonly hasUnsavedChanges = computed(() => {
    // This is a simplified check. Ideally we'd compare deep equality with original photos.
    // For now, we rely on the user to save.
    // We could implement a dirty flag if needed.
    return false; // Placeholder, as tracking deep changes is complex. Use indicators instead.
  });

  save(): void {
    // TODO
  }

  getCategoryLabel(id: string): string {
    const cat = this.categories().find((c) => c.id === id);
    return cat ? cat.categoryName! : id;
  }
  
  reusableLocations(): any[] | null | undefined {
    return []; // TODO
  }
}
