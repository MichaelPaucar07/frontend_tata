import { ErrorMessages } from '@shared/utils/form-errors';

/** Domain-specific messages; generic ones (required, min/max length) come from shared. */
export const PRODUCT_ERROR_MESSAGES: ErrorMessages = {
  idTaken: 'ID no válido! Ya existe un producto con este ID.',
  idVerificationFailed: 'No se pudo verificar el ID. Intenta nuevamente.',
  minToday: 'La fecha debe ser igual o mayor a la fecha actual.',
  oneYearAfter: 'Debe ser exactamente un año posterior a la fecha de liberación.',
};
