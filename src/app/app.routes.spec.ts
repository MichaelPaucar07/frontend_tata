import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By, Title } from '@angular/platform-browser';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ProductFormPageComponent } from '@features/products/pages/product-form-page/product-form-page.component';
import { ProductListPageComponent } from '@features/products/pages/product-list-page/product-list-page.component';
import { NotFoundComponent } from '@shared/pages/not-found/not-found.component';
import { routes } from './app.routes';

describe('App routes', () => {
  let harness: RouterTestingHarness;

  /** Pages render inside the PrincipalComponent layout, so query the nested instance. */
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
        // The list page loads products on init; keep HTTP inside the test.
        provideHttpClient(),
        provideHttpClientTesting(),
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

  it('should bind the :id param and open the form in edit mode', async () => {
    const page = await navigate('/products/trj-crd/edit', ProductFormPageComponent);
    expect(page.id()).toBe('trj-crd');
    expect(page.isEdit()).toBe(true);
  });

  it('should show the not-found page for unknown urls', async () => {
    await navigate('/does-not-exist', NotFoundComponent);
    expect(TestBed.inject(Title).getTitle()).toBe('Página no encontrada | Banco');
  });
});
