import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ButtonModule, CardModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly tenantService = inject(TenantService);
}
