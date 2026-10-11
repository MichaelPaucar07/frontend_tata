import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { SKIP_ERROR_NOTIFY } from '@core/interceptors/error/error.interceptor';
import { Product, ProductUpdate } from '@core/models/product/product';
import { ProductsService } from './products.service';

const PRODUCT: Product = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'https://example.com/visa.jpg',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
};

describe('ProductsService', () => {
  const baseUrl = `${environment.apiUrl}/products`;
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() should GET products and unwrap data', () => {
    let result: Product[] | undefined;
    service.getAll().subscribe((products) => (result = products));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [PRODUCT] });

    expect(result).toEqual([PRODUCT]);
  });

  it('create() should POST the product and return the created one', () => {
    let result: Product | undefined;
    service.create(PRODUCT).subscribe((product) => (result = product));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(PRODUCT);
    req.flush({ message: 'Product added successfully', data: PRODUCT });

    expect(result).toEqual(PRODUCT);
  });

  it('update() should PUT without id and restore it in the result', () => {
    const { id, ...changes } = PRODUCT;
    const body: ProductUpdate = { ...changes, name: 'Nombre actualizado' };
    let result: Product | undefined;
    service.update(id, body).subscribe((product) => (result = product));

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ message: 'Product updated successfully', data: body });

    expect(result).toEqual({ id, ...body });
  });

  it('update() should encode the id in the URL', () => {
    const { id: _id, ...changes } = PRODUCT;
    service.update('a/b', changes).subscribe();

    httpMock.expectOne(`${baseUrl}/a%2Fb`).flush({ message: 'ok', data: changes });
  });

  it.each([true, false])('verifyId() should return %s silently (no toast)', (exists) => {
    let result: boolean | undefined;
    service.verifyId('uno').subscribe((value) => (result = value));

    const req = httpMock.expectOne(`${baseUrl}/verification/uno`);
    expect(req.request.method).toBe('GET');
    expect(req.request.context.get(SKIP_ERROR_NOTIFY)).toBe(true);
    req.flush(exists);

    expect(result).toBe(exists);
  });
});
