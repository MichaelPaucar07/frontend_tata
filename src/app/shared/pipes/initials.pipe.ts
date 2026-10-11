import { Pipe, PipeTransform } from '@angular/core';

/** "Tarjetas de Crédito" → "TD". Used as avatar fallback when a logo fails. */
@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined, max = 2): string {
    if (!value) {
      return '';
    }
    return value
      .trim()
      .split(/\s+/)
      .slice(0, max)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }
}
