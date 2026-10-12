import { Injectable, inject } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { ProductsService } from '@core/service/products/products.service';
import { addYearsIso, todayIso } from '@shared/utils/date.utils';

export const ID_CHECK_DEBOUNCE_MS = 400;

/** LA FECHA TIENE QUE SER HOY O MAS ADELANTE. `today` SE PUEDE CAMBIAR EN LAS PRUEBAS PARA QUE NO DEPENDAN DEL DIA. */
export function minTodayValidator(today: () => string = todayIso): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value) {
      return null;
    }
    return value < today() ? { minToday: true } : null;
  };
}

/** LA REVISION TIENE QUE CAER EXACTAMENTE UN ANIO DESPUES DE LA FECHA DE LIBERACION. */
export function oneYearAfterValidator(releaseControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const release: string | undefined = control.parent?.get(releaseControlName)?.value;
    if (!control.value || !release) {
      return null;
    }
    return control.value === addYearsIso(release, 1) ? null : { oneYearAfter: true };
  };
}

/**
 * REVISA EN LA API (`/verification/:id`) QUE EL ID NO ESTE OCUPADO.
 * ANGULAR CANCELA LA VALIDACION ANTERIOR CON CADA TECLA, ASI QUE EL `timer`
 * HACE DE DEBOUNCE: SOLO CONSULTAMOS CUANDO EL USUARIO DEJA DE ESCRIBIR.
 */
@Injectable({ providedIn: 'root' })
export class UniqueProductIdValidator implements AsyncValidator {
  private readonly api = inject(ProductsService);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    const id = String(control.value ?? '').trim();
    if (!id) {
      return of(null);
    }
    return timer(ID_CHECK_DEBOUNCE_MS).pipe(
      switchMap(() => this.api.verifyId(id)),
      map((exists) => (exists ? { idTaken: true } : null)),
      catchError(() => of({ idVerificationFailed: true })),
    );
  }
}
