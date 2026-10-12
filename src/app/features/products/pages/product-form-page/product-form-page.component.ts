import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Product } from '@core/models/product/product';
import { NotifyService } from '@core/service/ui/notify/notify.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ProductsStore } from '../../state/products.store';

/**
 * ESTA PAGINA SIRVE PARA CREAR Y PARA EDITAR:
 * - EN `/products/new` NO HAY PRODUCTO, ASI QUE CREAMOS UNO NUEVO.
 * - EN `/products/:id/edit` EL RESOLVER NOS ENTREGA EL `product` Y LO EDITAMOS.
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

  /** LLEGA DESDE EL RESOLVER DE LA RUTA GRACIAS A withComponentInputBinding. */
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
      error: () => this.submitting.set(false),
    });
  }
}
