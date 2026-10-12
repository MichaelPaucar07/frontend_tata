import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Product } from '@core/models/product/product';
import { NotifyService } from '@core/service/ui/notify/notify.service';
import { ProductsStore } from '../state/products.store';

export const PRODUCT_NOT_FOUND_MESSAGE = 'El producto que intentas editar no existe.';

/**
 * CARGA EL PRODUCTO DE `/products/:id/edit` ANTES DE MOSTRAR LA PAGINA.
 * LA API NO TIENE GET POR ID, ASI QUE EL STORE LO BUSCA EN LA LISTA (CACHEADA).
 * ID INEXISTENTE O FALLO DE LA API → VUELVE AL LISTADO.
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
    catchError(() => of(backToList)),
  );
};
