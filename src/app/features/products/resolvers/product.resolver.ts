import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Product } from '@core/models/product/product';
import { NotifyService } from '@core/service/ui/notify/notify.service';
import { ProductsStore } from '../state/products.store';

export const PRODUCT_NOT_FOUND_MESSAGE = 'El producto que intentas editar no existe.';

/**
 * TRAE EL PRODUCTO ANTES DE ABRIR LA PANTALLA DE EDICION.
 * COMO LA API NO TIENE UN GET POR ID, LO BUSCAMOS EN LA LISTA QUE YA TIENE EL STORE.
 * SI NO EXISTE O LA API FALLA, REGRESAMOS AL LISTADO.
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
