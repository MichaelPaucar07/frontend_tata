import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { Product } from '@core/models/product/product';
import { ProductsService } from '@core/service/products/products.service';
import { buildProduct, buildProducts } from '../testing/product.fixtures';
import { ProductsStore } from './products.store';

describe('ProductsStore', () => {
  let store: ProductsStore;
  let api: { getAll: jest.Mock; create: jest.Mock };

  beforeEach(() => {
    api = { getAll: jest.fn(), create: jest.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: ProductsService, useValue: api }],
    });
    store = TestBed.inject(ProductsStore);
  });

  describe('load()', () => {
    it('should toggle loading and store the products', () => {
      const response$ = new Subject<Product[]>();
      api.getAll.mockReturnValue(response$);

      store.load();
      expect(store.loading()).toBe(true);

      response$.next(buildProducts(3));
      response$.complete();

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe(false);
      expect(store.products().length).toBe(3);
    });

    it('should flag the error and stop loading on failure', () => {
      api.getAll.mockReturnValue(throwError(() => new Error('boom')));

      store.load();

      expect(store.error()).toBe(true);
      expect(store.loading()).toBe(false);
    });

    it('should clear a previous error when retrying', () => {
      api.getAll.mockReturnValueOnce(throwError(() => new Error('boom')));
      store.load();

      api.getAll.mockReturnValueOnce(of([]));
      store.load();

      expect(store.error()).toBe(false);
    });
  });

  describe('search (F2)', () => {
    beforeEach(() => {
      api.getAll.mockReturnValue(
        of([
          buildProduct({ id: 'a', name: 'Tarjeta de Crédito', description: 'Consumo diario' }),
          buildProduct({ id: 'b', name: 'Cuenta de Ahorros', description: 'Ahorro programado' }),
          buildProduct({ id: 'c', name: 'Préstamo', description: 'Crédito hipotecario' }),
        ]),
      );
      store.load();
    });

    it('should return everything with an empty term', () => {
      store.setSearchTerm('   ');
      expect(store.total()).toBe(3);
    });

    it('should match name or description ignoring case and accents', () => {
      store.setSearchTerm('CREDITO');
      expect(store.filtered().map((p) => p.id)).toEqual(['a', 'c']);
    });

    it('should return no results when nothing matches', () => {
      store.setSearchTerm('xyz');
      expect(store.total()).toBe(0);
      expect(store.visible()).toEqual([]);
    });
  });

  describe('page size (F3)', () => {
    beforeEach(() => {
      api.getAll.mockReturnValue(of(buildProducts(12)));
      store.load();
    });

    it('should default to 5 rows', () => {
      expect(store.pageSize()).toBe(5);
      expect(store.visible().length).toBe(5);
    });

    it('should show up to the selected page size', () => {
      store.setPageSize(10);
      expect(store.visible().length).toBe(10);

      store.setPageSize(20);
      expect(store.visible().length).toBe(12);
    });

    it('should count all filtered results, not only the visible ones', () => {
      expect(store.total()).toBe(12);
    });
  });

  describe('create() (F4)', () => {
    it('should append the created product to the cached list', () => {
      api.getAll.mockReturnValue(of(buildProducts(1)));
      store.load();
      const created = buildProduct({ id: 'nuevo' });
      api.create.mockReturnValue(of(created));

      let result: Product | undefined;
      store.create(created).subscribe((p) => (result = p));

      expect(api.create).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
      expect(store.products().map((p) => p.id)).toEqual(['prod-1', 'nuevo']);
    });

    it('should leave the list untouched and propagate the error on failure', () => {
      api.create.mockReturnValue(throwError(() => new Error('400')));
      const onError = jest.fn();

      store.create(buildProduct()).subscribe({ error: onError });

      expect(onError).toHaveBeenCalled();
      expect(store.products()).toEqual([]);
    });
  });
});
