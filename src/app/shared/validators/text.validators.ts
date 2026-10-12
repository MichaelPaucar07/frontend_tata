import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const trimmed = (control: AbstractControl): string => String(control.value ?? '').trim();

/** COMO `Validators.required`, PERO UN CAMPO CON SOLO ESPACIOS TAMBIEN CUENTA COMO VACIO. */
export function requiredText(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    trimmed(control) ? null : { required: true };
}

/**
 * MIDE EL LARGO SIN CONTAR LOS ESPACIOS DE LOS EXTREMOS. DEVUELVE LOS MISMOS ERRORES
 * QUE `minLength`/`maxLength` DE ANGULAR, ASI LOS MENSAJES QUE YA TENEMOS SIGUEN SIRVIENDO.
 */
export function textLength(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = trimmed(control);
    if (!value) {
      return null;
    }
    if (value.length < min) {
      return { minlength: { requiredLength: min, actualLength: value.length } };
    }
    if (value.length > max) {
      return { maxlength: { requiredLength: max, actualLength: value.length } };
    }
    return null;
  };
}
