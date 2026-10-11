import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotifyService } from '@core/service/ui/notify/notify.service';
import { SKIP_ERROR_NOTIFY, errorInterceptor, resolveErrorMessage } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let notify: { error: jest.Mock };

  beforeEach(() => {
    notify = { error: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotifyService, useValue: notify },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should pass successful responses through untouched', () => {
    let result: unknown;
    http.get('/test').subscribe((res) => (result = res));

    httpMock.expectOne('/test').flush({ ok: true });

    expect(result).toEqual({ ok: true });
    expect(notify.error).not.toHaveBeenCalled();
  });

  it('should notify and re-throw on HTTP errors', () => {
    let status: number | undefined;
    http.get('/test').subscribe({ error: (err) => (status = err.status) });

    httpMock.expectOne('/test').flush({}, { status: 404, statusText: 'Not Found' });

    expect(notify.error).toHaveBeenCalledWith(resolveErrorMessage(404));
    expect(status).toBe(404);
  });

  it('should not notify when the request opts out', () => {
    const context = new HttpContext().set(SKIP_ERROR_NOTIFY, true);
    http.get('/test', { context }).subscribe({ error: () => undefined });

    httpMock.expectOne('/test').flush({}, { status: 500, statusText: 'Server Error' });

    expect(notify.error).not.toHaveBeenCalled();
  });
});

describe('resolveErrorMessage', () => {
  it.each([
    [0, 'No se pudo conectar'],
    [400, 'no son válidos'],
    [404, 'no existe'],
    [500, 'error en el servidor'],
    [503, 'error en el servidor'],
    [418, 'error inesperado'],
  ])('status %i → message containing "%s"', (status, fragment) => {
    expect(resolveErrorMessage(status)).toContain(fragment);
  });
});
