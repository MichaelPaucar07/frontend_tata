import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By, Title } from '@angular/platform-browser';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProductsService } from '@core/service/products/products.service';
import { ProductFormPageComponent } from '@features/products/pages/product-form-page/product-form-page.component';
import { ProductListPageComponent } from '@features/products/pages/product-list-page/product-list-page.component';
import { buildProduct } from '@features/products/testing/product.fixtures';
import { NotFoundComponent } from '@shared/pages/not-found/not-found.component';
import { routes } from './app.routes';

describe('App routes', () => {
  const existing = buildProduct({ id: 'trj-crd' });
  let harness: RouterTestingHarness;

  /** LAS PAGINAS VIVEN DENTRO DEL LAYOUT, ASI QUE BUSCAMOS EL COMPONENTE HIJO Y NO EL QUE DEVUELVE EL HARNESS. */
  async function navigate<T>(url: string, page: Type<T>): Promise<T> {
    await harness.navigateByUrl(url);
    const debugElement = harness.fixture.debugElement.query(By.directive(page));
    expect(debugElement).not.toBeNull();
    return debugElement.componentInstance as T;
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        // USAMOS UNA API FALSA PARA QUE ESTAS PRUEBAS NO DEPENDAN DE HTTP.
        {
          provide: ProductsService,
          useValue: { getAll: () => of([existing]), verifyId: () => of(false) },
        },
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  it('should redirect the empty path to /products', async () => {
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/products');
  });

  it('should lazy-load the list page', async () => {
    await navigate('/products', ProductListPageComponent);
    expect(TestBed.inject(Title).getTitle()).toBe('Productos financieros | Banco');
  });

  it('should open the form in create mode on /products/new', async () => {
    const page = await navigate('/products/new', ProductFormPageComponent);
    expect(page.isEdit()).toBe(false);
  });

  it('should resolve the product and open the form in edit mode', async () => {
    const page = await navigate('/products/trj-crd/edit', ProductFormPageComponent);
    expect(page.product()).toEqual(existing);
    expect(page.isEdit()).toBe(true);
    expect(TestBed.inject(Title).getTitle()).toBe('Editar producto | Banco');
  });

  it('should redirect to the list when editing an unknown product', async () => {
    await harness.navigateByUrl('/products/nope/edit');
    expect(TestBed.inject(Router).url).toBe('/products');
  });

  it('should show the not-found page for unknown urls', async () => {
    await navigate('/does-not-exist', NotFoundComponent);
    expect(TestBed.inject(Title).getTitle()).toBe('Página no encontrada | Banco');
  });
});
