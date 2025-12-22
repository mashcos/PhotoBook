import { AuthenticationProvider, RequestInformation } from '@microsoft/kiota-abstractions';
import { TenantService } from './tenant.service';

export class TenantAuthenticationProvider implements AuthenticationProvider {
  // Wir injizieren den TenantService
  constructor(private tenantService: TenantService) {}

  public authenticateRequest(request: RequestInformation): Promise<void> {
    const tenantId = this.tenantService.currentTenant();
    
    if (tenantId) {
      request.headers.add('X-Tenant-ID', tenantId);
    }
    
    return Promise.resolve();
  }
}