import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Create (F4) / edit (F5) page. One component, two modes:
 * `/products/new` → no id → create; `/products/:id/edit` → id bound from the route → edit.
 * Form implemented in Step 4.
 */
@Component({
  selector: 'app-product-form-page',
  standalone: true,
  template: '<h1 class="sr-only">{{ isEdit() ? "Editar producto" : "Formulario de Registro" }}</h1>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPageComponent {
  /** Bound automatically from the `:id` route param (withComponentInputBinding). */
  readonly id = input<string>();
  readonly isEdit = computed(() => !!this.id());
}
