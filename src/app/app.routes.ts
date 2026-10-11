import { Routes } from '@angular/router';
import { PrincipalComponent } from './layout/principal/principal.component';

export const routes: Routes = [
  {
    path: '',
    component: PrincipalComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        loadChildren: () =>
          import('@features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
      },
      {
        path: '**',
        title: 'Página no encontrada | Banco',
        loadComponent: () =>
          import('@shared/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
