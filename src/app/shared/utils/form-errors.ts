import { ValidationErrors } from '@angular/forms';

export type ErrorMessage = string | ((error: unknown) => string);
export type ErrorMessages = Record<string, ErrorMessage>;

interface LengthError {
  requiredLength: number;
}

export const DEFAULT_ERROR_MESSAGES: ErrorMessages = {
  required: 'Este campo es requerido!',
  minlength: (error) => `Debe tener mínimo ${(error as LengthError).requiredLength} caracteres.`,
  maxlength: (error) => `Debe tener máximo ${(error as LengthError).requiredLength} caracteres.`,
};

export const FALLBACK_ERROR_MESSAGE = 'Valor no válido.';

/** First error wins; custom messages override the defaults. */
export function getControlErrorMessage(
  errors: ValidationErrors | null,
  custom: ErrorMessages = {},
): string | null {
  if (!errors) {
    return null;
  }
  const [key] = Object.keys(errors);
  if (!key) {
    return null;
  }
  const message = custom[key] ?? DEFAULT_ERROR_MESSAGES[key];
  if (!message) {
    return FALLBACK_ERROR_MESSAGE;
  }
  return typeof message === 'function' ? message(errors[key]) : message;
}
