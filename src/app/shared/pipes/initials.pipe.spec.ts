import { InitialsPipe } from './initials.pipe';

describe('InitialsPipe', () => {
  const pipe = new InitialsPipe();

  it.each([
    ['Tarjetas de Crédito', 'TD'],
    ['cuenta', 'C'],
    ['  juan   garcía  ', 'JG'],
    ['', ''],
    [null, ''],
    [undefined, ''],
  ])('"%s" → "%s"', (input, expected) => {
    expect(pipe.transform(input)).toBe(expected);
  });

  it('should respect a custom max', () => {
    expect(pipe.transform('Uno Dos Tres', 3)).toBe('UDT');
  });
});
