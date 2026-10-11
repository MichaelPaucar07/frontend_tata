import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { Product } from '@core/models/product/product';

interface MenuPosition {
  top: number;
  right: number;
}

const MENU_OFFSET_PX = 4;

/**
 * Per-row dropdown (D3). The panel uses `position: fixed` so the table's
 * horizontal-scroll container cannot clip it; it closes on outside click,
 * Escape, scroll and resize because the fixed coordinates would go stale.
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
