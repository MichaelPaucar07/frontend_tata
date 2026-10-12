import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotifyService } from '@core/service/ui/notify/notify.service';

/** PARA LAS PETICIONES QUE PREFIEREN MANEJAR SU PROPIO ERROR SIN MOSTRAR TOAST. */
export const SKIP_ERROR_NOTIFY = new HttpContextToken<boolean>(() => false);

export function resolveErrorMessage(status: number): string {
  if (status === 0) {
    return 'No se pudo conectar con el servidor. Verifica que el servicio esté disponible.';
  }
  if (status === 400) {
    return 'Los datos enviados no son válidos. Revisa la información e intenta nuevamente.';
  }
  if (status === 404) {
    return 'El producto solicitado no existe.';
  }
  if (status >= 500) {
    return 'Ocurrió un error en el servidor. Intenta nuevamente más tarde.';
  }
  return 'Ocurrió un error inesperado. Intenta nuevamente.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotifyService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && !req.context.get(SKIP_ERROR_NOTIFY)) {
        notify.error(resolveErrorMessage(error.status));
      }
      // VOLVEMOS A LANZAR EL ERROR PARA QUE CADA PANTALLA DECIDA QUE HACER (QUITAR EL LOADING, MARCAR EL CAMPO, ETC.).
      return throwError(() => error);
    }),
  );
};
