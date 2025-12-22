import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantService {
  // Wir nutzen ein Signal für einfache Reaktivität
  private _currentTenant = signal<string | null>(null);
  
  public readonly currentTenant = this._currentTenant.asReadonly();

  setTenant(tenantId: string) {
    this._currentTenant.set(tenantId.toLowerCase());
  }
}