import { FormControl } from '@angular/forms';
import { requiredText, textLength } from './text.validators';

describe('requiredText', () => {
  const check = (value: unknown) => requiredText()(new FormControl(value));

  it.each([[''], ['   '], [null], [undefined]])('should flag %p as required', (value) => {
    expect(check(value)).toEqual({ required: true });
  });

  it('should accept any non-blank text', () => {
    expect(check('  a  ')).toBeNull();
  });
});

describe('textLength', () => {
  const check = (value: unknown) => textLength(5, 10)(new FormControl(value));

  it('should ignore empty values (requiredText handles them)', () => {
    expect(check('')).toBeNull();
    expect(check('   ')).toBeNull();
  });

  it('should not count surrounding spaces', () => {
    expect(check('  abcd  ')).toEqual({ minlength: { requiredLength: 5, actualLength: 4 } });
    expect(check('   abcde   ')).toBeNull();
  });

  it('should flag text longer than the max', () => {
    expect(check('abcdefghijk')).toEqual({ maxlength: { requiredLength: 10, actualLength: 11 } });
  });

  it('should accept the exact limits', () => {
    expect(check('abcde')).toBeNull();
    expect(check('abcdefghij')).toBeNull();
  });
});
