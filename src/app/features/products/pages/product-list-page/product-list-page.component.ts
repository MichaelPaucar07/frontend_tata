import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Listing page (F1, F2, F3). Implemented in Step 3. */
@Component({
  selector: 'app-product-list-page',
  standalone: true,
  template: '<h1 class="sr-only">Productos financieros</h1>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPageComponent {}
