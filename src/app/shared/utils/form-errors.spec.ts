import { FALLBACK_ERROR_MESSAGE, getControlErrorMessage } from './form-errors';

describe('getControlErrorMessage', () => {
  it('should return null without errors', () => {
    expect(getControlErrorMessage(null)).toBeNull();
    expect(getControlErrorMessage({})).toBeNull();
  });

  it('should resolve default messages', () => {
    expect(getControlErrorMessage({ required: true })).toBe('Este campo es requerido!');
    expect(getControlErrorMessage({ minlength: { requiredLength: 3, actualLength: 1 } })).toBe(
      'Debe tener mínimo 3 caracteres.',
    );
    expect(getControlErrorMessage({ maxlength: { requiredLength: 10, actualLength: 11 } })).toBe(
      'Debe tener máximo 10 caracteres.',
    );
  });

  it('should prefer custom messages over defaults', () => {
    expect(getControlErrorMessage({ required: true }, { required: 'Obligatorio' })).toBe(
      'Obligatorio',
    );
  });

  it('should use the fallback for unknown errors', () => {
    expect(getControlErrorMessage({ weird: true })).toBe(FALLBACK_ERROR_MESSAGE);
  });
});
