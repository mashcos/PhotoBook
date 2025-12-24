import { LogLevel, PassedInitialConfig } from 'angular-auth-oidc-client';

export const auth: PassedInitialConfig = {
  config: {
    authority: 'https://localhost:5001',
    redirectUrl: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    clientId: 'angular_demo',

    scope: 'openid profile offline_access',

    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,

    secureRoutes: ['https://localhost:5001/'],

    logLevel: LogLevel.Debug,
  },
};
