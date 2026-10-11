import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '@core/models/product/product';
import { NotifyService } from '@core/service/ui/notify/notify.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ProductsStore } from '../../state/products.store';

/**
 * Create (F4) / edit (F5) page. One component, two modes:
 * `/products/new` → no id → create; `/products/:id/edit` → id bound from the route → edit.
 */
@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [ProductFormComponent],
  templateUrl: './product-form-page.component.html',
  styleUrl: './product-form-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPageComponent {
  private readonly store = inject(ProductsStore);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  /** Bound automatically from the `:id` route param (withComponentInputBinding). */
  readonly id = input<string>();
  readonly isEdit = computed(() => !!this.id());

  protected readonly submitting = signal(false);

  protected onSubmit(product: Product): void {
    this.submitting.set(true);
    this.store.create(product).subscribe({
      next: () => {
        this.notify.success('Producto agregado correctamente.');
        this.router.navigate(['/products']);
      },
      // The interceptor already shows the error; just let the user retry.
      error: () => this.submitting.set(false),
    });
  }
}
