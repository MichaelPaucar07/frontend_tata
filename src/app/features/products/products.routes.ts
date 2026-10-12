import { Routes } from '@angular/router';
import { productResolver } from './resolvers/product.resolver';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    title: 'Productos financieros | Banco',
    loadComponent: () =>
      import('./pages/product-list-page/product-list-page.component').then(
        (m) => m.ProductListPageComponent,
      ),
  },
  {
    path: 'new',
    title: 'Agregar producto | Banco',
    loadComponent: () =>
      import('./pages/product-form-page/product-form-page.component').then(
        (m) => m.ProductFormPageComponent,
      ),
  },
  {
    path: ':id/edit',
    title: 'Editar producto | Banco',
    // EL PRODUCTO RESUELTO LE LLEGA A LA PAGINA COMO EL INPUT `product`.
    resolve: { product: productResolver },
    loadComponent: () =>
      import('./pages/product-form-page/product-form-page.component').then(
        (m) => m.ProductFormPageComponent,
      ),
  },
];
