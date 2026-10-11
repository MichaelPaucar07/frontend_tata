import { normalizeText } from './text.utils';

describe('normalizeText', () => {
  it.each([
    ['Crédito', 'credito'],
    ['  TARJETA  ', 'tarjeta'],
    ['Ñandú', 'nandu'],
    ['', ''],
  ])('"%s" → "%s"', (input, expected) => {
    expect(normalizeText(input)).toBe(expected);
  });
});
