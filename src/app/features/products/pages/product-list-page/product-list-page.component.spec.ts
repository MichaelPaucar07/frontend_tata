import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Product } from '@core/models/product/product';
import { ProductListFooterComponent } from '../../components/product-list-footer/product-list-footer.component';
import { ProductSearchComponent } from '../../components/product-search/product-search.component';
import { ProductTableComponent } from '../../components/product-table/product-table.component';
import { PageSize, ProductsStore } from '../../state/products.store';
import { buildProducts } from '../../testing/product.fixtures';
import { ProductListPageComponent } from './product-list-page.component';

/** Minimal signal-based fake: the page only reads signals and calls methods. */
function createStoreMock() {
  return {
    products: signal<Product[]>([]),
    visible: signal<Product[]>([]),
    total: signal(0),
    loading: signal(false),
    error: signal(false),
    searchTerm: signal(''),
    pageSize: signal<PageSize>(5),
    load: jest.fn(),
    setSearchTerm: jest.fn(),
    setPageSize: jest.fn(),
  };
}

describe('ProductListPageComponent', () => {
  let fixture: ComponentFixture<ProductListPageComponent>;
  let store: ReturnType<typeof createStoreMock>;
  const el = (): HTMLElement => fixture.nativeElement;

  beforeEach(() => {
    store = createStoreMock();
    TestBed.configureTestingModule({
      imports: [ProductListPageComponent],
      providers: [provideRouter([]), { provide: ProductsStore, useValue: store }],
    });
    fixture = TestBed.createComponent(ProductListPageComponent);
  });

  it('should load products on init', () => {
    fixture.detectChanges();
    expect(store.load).toHaveBeenCalledTimes(1);
  });

  it('should render the "Agregar" link to the create form', () => {
    fixture.detectChanges();
    const link = el().querySelector<HTMLAnchorElement>('.toolbar a');
    expect(link?.textContent?.trim()).toBe('Agregar');
    expect(link?.getAttribute('href')).toBe('/new');
  });

  it('should show the loader on the first load', () => {
    store.loading.set(true);
    fixture.detectChanges();

    expect(el().querySelector('.spinner')).not.toBeNull();
    expect(el().querySelector('app-product-table')).toBeNull();
  });

  it('should keep showing cached rows while reloading', () => {
    store.loading.set(true);
    store.products.set(buildProducts(2));
    fixture.detectChanges();

    expect(el().querySelector('.spinner')).toBeNull();
    expect(el().querySelector('app-product-table')).not.toBeNull();
  });

  it('should show the error state and retry on click', () => {
    store.error.set(true);
    fixture.detectChanges();

    const retry = el().querySelector<HTMLButtonElement>('.state--error button')!;
    expect(retry.textContent?.trim()).toBe('Reintentar');

    retry.click();
    expect(store.load).toHaveBeenCalledTimes(2);
  });

  it('should pass visible rows and total to the presentational components', () => {
    const products = buildProducts(5);
    store.products.set(buildProducts(8));
    store.visible.set(products);
    store.total.set(8);
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(ProductTableComponent));
    const footer = fixture.debugElement.query(By.directive(ProductListFooterComponent));
    expect(table.componentInstance.products()).toBe(products);
    expect(footer.componentInstance.total()).toBe(8);
  });

  it('should adapt the empty message to the search term', () => {
    fixture.detectChanges();
    const table = () =>
      fixture.debugElement.query(By.directive(ProductTableComponent)).componentInstance;
    expect(table().emptyMessage()).toBe('No hay productos registrados.');

    store.searchTerm.set(' xyz ');
    fixture.detectChanges();
    expect(table().emptyMessage()).toBe('No se encontraron productos para "xyz".');
  });

  it('should forward search and page size changes to the store', () => {
    fixture.detectChanges();

    fixture.debugElement
      .query(By.directive(ProductSearchComponent))
      .triggerEventHandler('searchChange', 'tarjeta');
    fixture.debugElement
      .query(By.directive(ProductListFooterComponent))
      .triggerEventHandler('pageSizeChange', 20);

    expect(store.setSearchTerm).toHaveBeenCalledWith('tarjeta');
    expect(store.setPageSize).toHaveBeenCalledWith(20);
  });
});
