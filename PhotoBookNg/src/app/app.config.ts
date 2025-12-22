import { ApplicationConfig, inject, InjectionToken, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';
import { routes } from './app.routes';
import { TenantService } from './services/tenant.service';
import { TenantAuthenticationProvider } from './services/tenant-auth-provider';
import { createPhotoBookClient, PhotoBookClient } from './client/photoBookClient';
import Aura from '@primeuix/themes/aura';

// Custom theme with warm Amber/Orange colors for "Summer in Germany" vibe
const SummerTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{amber.50}',
      100: '{amber.100}',
      200: '{amber.200}',
      300: '{amber.300}',
      400: '{amber.400}',
      500: '{amber.500}',
      600: '{amber.600}',
      700: '{amber.700}',
      800: '{amber.800}',
      900: '{amber.900}',
      950: '{amber.950}',
    },
  },
});

export const PHOTO_BOOK_CLIENT = new InjectionToken<PhotoBookClient>('PhotoBookClient');

export function photoBookClientFactory(): PhotoBookClient {
  const tenantService = inject(TenantService);
  const authProvider = new TenantAuthenticationProvider(tenantService);
  const adapter = new FetchRequestAdapter(authProvider);
  
  // Base URL setzen
  adapter.baseUrl = '/'; 

  return createPhotoBookClient(adapter);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SummerTheme,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    { provide: PHOTO_BOOK_CLIENT, useFactory: photoBookClientFactory },
  ],
};
