import { ErrorMessages } from '@shared/utils/form-errors';

/** MENSAJES PROPIOS DE PRODUCTOS. LOS GENERALES (REQUERIDO, MINIMO, MAXIMO) ESTAN EN SHARED. */
export const PRODUCT_ERROR_MESSAGES: ErrorMessages = {
  idTaken: 'ID no válido! Ya existe un producto con este ID.',
  idVerificationFailed: 'No se pudo verificar el ID. Intenta nuevamente.',
  minToday: 'La fecha debe ser igual o mayor a la fecha actual.',
  oneYearAfter: 'Debe ser exactamente un año posterior a la fecha de liberación.',
};
