import { LogLevel, PassedInitialConfig } from 'angular-auth-oidc-client';

export const auth: PassedInitialConfig = {
  config: {
    authority: 'https://localhost:5001',
    redirectUrl: window.location.origin + '/admin/login',
    postLogoutRedirectUri: window.location.origin + '/logout',
    clientId: 'photobook',

    scope: 'openid profile email offline_access tenant_id',

    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,

    secureRoutes: [
      'https://localhost:5001/',
      'https://localhost:4200/'
    ],

    logLevel: LogLevel.Debug,
  },
};
