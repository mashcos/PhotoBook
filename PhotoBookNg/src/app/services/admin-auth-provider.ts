import { AuthenticationProvider, RequestInformation } from '@microsoft/kiota-abstractions';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';

export class AdminAuthenticationProvider implements AuthenticationProvider {
  constructor(private oidcSecurityService: OidcSecurityService) {}

  public async authenticateRequest(request: RequestInformation): Promise<void> {
    const token = await firstValueFrom(this.oidcSecurityService.getAccessToken());
    
    if (token) {
      request.headers.add('Authorization', `Bearer ${token}`);
    }    
  }
}