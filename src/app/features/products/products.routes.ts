import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./pages/product-form-page/product-form-page.component').then(
        (m) => m.ProductFormPageComponent,
      ),
  },
];
