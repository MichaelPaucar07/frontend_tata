import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

export const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-product-search',
  standalone: true,
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearchComponent {
  /** VALOR ACTUAL DE LA BUSQUEDA, PARA QUE NO SE PIERDA AL VOLVER AL LISTADO. */
  readonly value = input('');

  private readonly term$ = new Subject<string>();

  /** AVISA CUANDO EL USUARIO TERMINA DE ESCRIBIR, Y SOLO SI DE VERDAD CAMBIO LO QUE BUSCA. */
  readonly searchChange = outputFromObservable(
    this.term$.pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged()),
  );

  protected onInput(event: Event): void {
    this.term$.next((event.target as HTMLInputElement).value);
  }
}
