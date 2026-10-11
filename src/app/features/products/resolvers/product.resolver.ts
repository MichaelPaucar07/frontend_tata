import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Product } from '@core/models/product/product';
import { NotifyService } from '@core/service/ui/notify/notify.service';
import { ProductsStore } from '../state/products.store';

export const PRODUCT_NOT_FOUND_MESSAGE = 'El producto que intentas editar no existe.';

/**
 * Loads the product for `/products/:id/edit` before the page renders.
 * The API has no GET-by-id, so the store resolves it from the (cached) list.
 * Unknown id or API failure → back to the list.
 */
export const productResolver: ResolveFn<Product> = (route) => {
  const store = inject(ProductsStore);
  const router = inject(Router);
  const notify = inject(NotifyService);

  const backToList = new RedirectCommand(router.parseUrl('/products'));

  return store.findById(route.paramMap.get('id') ?? '').pipe(
    map((product) => {
      if (product) {
        return product;
      }
      notify.error(PRODUCT_NOT_FOUND_MESSAGE);
      return backToList;
    }),
    // HTTP errors were already notified by the interceptor.
    catchError(() => of(backToList)),
  );
};
