import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { Product } from '@core/models/product/product';
import { NotifyService } from '@core/service/ui/notify/notify.service';
import { ProductsStore } from '../state/products.store';
import { buildProduct } from '../testing/product.fixtures';
import { PRODUCT_NOT_FOUND_MESSAGE, productResolver } from './product.resolver';

describe('productResolver', () => {
  let store: { findById: jest.Mock };
  let notify: { error: jest.Mock };

  const resolve = (id?: string): Product | RedirectCommand | undefined => {
    const route = {
      paramMap: convertToParamMap(id === undefined ? {} : { id }),
    } as ActivatedRouteSnapshot;
    let result: Product | RedirectCommand | undefined;
    TestBed.runInInjectionContext(() =>
      (productResolver(route, {} as RouterStateSnapshot) as Observable<Product | RedirectCommand>)
        .subscribe((value) => (result = value)),
    );
    return result;
  };

  const expectRedirectToList = (result: unknown): void => {
    expect(result).toBeInstanceOf(RedirectCommand);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl((result as RedirectCommand).redirectTo as never)).toBe('/products');
  };

  beforeEach(() => {
    store = { findById: jest.fn() };
    notify = { error: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ProductsStore, useValue: store },
        { provide: NotifyService, useValue: notify },
      ],
    });
  });

  it('should resolve the product by the :id param', () => {
    const product = buildProduct({ id: 'trj-crd' });
    store.findById.mockReturnValue(of(product));

    expect(resolve('trj-crd')).toBe(product);
    expect(store.findById).toHaveBeenCalledWith('trj-crd');
  });

  it('should notify and redirect to the list when the product does not exist', () => {
    store.findById.mockReturnValue(of(undefined));

    expectRedirectToList(resolve('nope'));
    expect(notify.error).toHaveBeenCalledWith(PRODUCT_NOT_FOUND_MESSAGE);
  });

  it('should redirect without a second toast when the API fails', () => {
    store.findById.mockReturnValue(throwError(() => new Error('offline')));

    expectRedirectToList(resolve('trj-crd'));
    expect(notify.error).not.toHaveBeenCalled();
  });

  it('should treat a missing :id param as not found', () => {
    store.findById.mockReturnValue(of(undefined));

    expectRedirectToList(resolve());
    expect(store.findById).toHaveBeenCalledWith('');
  });
});
