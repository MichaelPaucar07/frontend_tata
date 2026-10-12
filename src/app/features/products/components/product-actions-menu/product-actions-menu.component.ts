import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { Product } from '@core/models/product/product';

interface MenuPosition {
  top: number;
  right: number;
}

const MENU_OFFSET_PX = 4;

/**
 * MENU DE ACCIONES DE CADA FILA (D3).
 * USAMOS `position: fixed` PORQUE LA TABLA TIENE SCROLL HORIZONTAL Y UN MENU NORMAL
 * QUEDABA CORTADO EN LAS ULTIMAS FILAS. POR LO MISMO LO CERRAMOS SI EL USUARIO HACE
 * SCROLL O CAMBIA EL TAMANIO DE LA VENTANA: LA POSICION YA NO SERIA LA CORRECTA.
 */
@Component({
  selector: 'app-product-actions-menu',
  standalone: true,
  templateUrl: './product-actions-menu.component.html',
  styleUrl: './product-actions-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
    '(window:resize)': 'close()',
    '(window:scroll)': 'close()',
  },
})
export class ProductActionsMenuComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly product = input.required<Product>();
  readonly edit = output<Product>();

  protected readonly position = signal<MenuPosition | null>(null);

  protected toggle(trigger: HTMLElement): void {
    if (this.position()) {
      this.close();
      return;
    }
    const rect = trigger.getBoundingClientRect();
    this.position.set({
      top: rect.bottom + MENU_OFFSET_PX,
      right: window.innerWidth - rect.right,
    });
  }

  close(): void {
    this.position.set(null);
  }

  protected onEdit(): void {
    this.close();
    this.edit.emit(this.product());
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.position() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
