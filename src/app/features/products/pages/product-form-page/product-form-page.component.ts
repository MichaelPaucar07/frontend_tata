import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Product } from '@core/models/product/product';
import { NotifyService } from '@core/service/ui/notify/notify.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ProductsStore } from '../../state/products.store';

/**
 * Create (F4) / edit (F5) page. One component, two modes:
 * `/products/new` → no product → create;
 * `/products/:id/edit` → `product` comes from productResolver → edit.
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

  /** Bound from the route resolver (withComponentInputBinding). */
  readonly product = input<Product>();
  readonly isEdit = computed(() => !!this.product());

  protected readonly title = computed(() =>
    this.isEdit() ? 'Editar Producto' : 'Formulario de Registro',
  );
  protected readonly submitting = signal(false);

  protected onSubmit(product: Product): void {
    const request$: Observable<Product> = this.isEdit()
      ? this.store.update(product)
      : this.store.create(product);
    const successMessage = this.isEdit()
      ? 'Producto actualizado correctamente.'
      : 'Producto agregado correctamente.';

    this.submitting.set(true);
    request$.subscribe({
      next: () => {
        this.notify.success(successMessage);
        this.router.navigate(['/products']);
      },
      // The interceptor already shows the error; just let the user retry.
      error: () => this.submitting.set(false),
    });
  }
}
