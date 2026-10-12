import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { errorInterceptor } from '@core/interceptors/error/error.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // LAS PAGINAS SIGUEN SIENDO LAZY, PERO SE DESCARGAN EN SEGUNDO PLANO APENAS CARGA LA APP;
    // ASI, AL PULSAR "AGREGAR" O "EDITAR" EL FORMULARIO YA ESTA LISTO.
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor])),
  ],
};
