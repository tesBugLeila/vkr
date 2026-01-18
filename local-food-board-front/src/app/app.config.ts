import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NgxMaskConfig, provideEnvironmentNgxMask } from 'ngx-mask';
import { provideHttpClient, withFetch } from '@angular/common/http';

const maskConfig: Partial<NgxMaskConfig> = { validation: false };

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideEnvironmentNgxMask(maskConfig),
    provideHttpClient(withFetch())
  ],
};
