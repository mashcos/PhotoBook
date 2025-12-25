import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminActivate implements CanActivate {
  constructor(
    private oidcSecurityService: OidcSecurityService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.oidcSecurityService.checkAuth().pipe(
      take(1),
      map(({ isAuthenticated }) => {
        // Wenn eingeloggt -> Zugriff gewähren
        if (isAuthenticated) {
          return true;
        }

        // Wenn nicht eingeloggt -> Login starten (oder auf Fehlerseite leiten)
        this.oidcSecurityService.authorize();
        return false;
      }),
    );
  }
}
