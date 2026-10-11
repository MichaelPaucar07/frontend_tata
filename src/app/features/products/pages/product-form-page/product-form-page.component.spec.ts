import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { Product } from '@core/models/product/product';
import { NotifyService } from '@core/service/ui/notify/notify.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ProductsStore } from '../../state/products.store';
import { buildProduct } from '../../testing/product.fixtures';
import { UniqueProductIdValidator } from '../../validators/product.validators';
import { ProductFormPageComponent } from './product-form-page.component';

describe('ProductFormPageComponent', () => {
  let fixture: ComponentFixture<ProductFormPageComponent>;
  let store: { create: jest.Mock; update: jest.Mock };
  let notify: { success: jest.Mock };
  let router: Router;
  let response$: Subject<Product>;

  const form = () => fixture.debugElement.query(By.directive(ProductFormComponent));
  const submit = (product: Product) => {
    form().triggerEventHandler('submitted', product);
    fixture.detectChanges();
  };

  beforeEach(() => {
    response$ = new Subject<Product>();
    store = {
      create: jest.fn().mockReturnValue(response$),
      update: jest.fn().mockReturnValue(response$),
    };
    notify = { success: jest.fn() };

    TestBed.configureTestingModule({
      imports: [ProductFormPageComponent],
      providers: [
        provideRouter([]),
        { provide: ProductsStore, useValue: store },
        { provide: NotifyService, useValue: notify },
        { provide: UniqueProductIdValidator, useValue: { validate: () => of(null) } },
      ],
    });
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ProductFormPageComponent);
    fixture.detectChanges();
  });

  it('should render the D2 title and the form', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Formulario de Registro');
    expect(form()).not.toBeNull();
  });

  it('should mark the form as submitting while the request is in flight', () => {
    submit(buildProduct());

    expect(store.create).toHaveBeenCalledWith(buildProduct());
    expect(form().componentInstance.submitting()).toBe(true);
  });

  it('should notify and go back to the list on success', () => {
    submit(buildProduct());
    response$.next(buildProduct());

    expect(notify.success).toHaveBeenCalledWith('Producto agregado correctamente.');
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should re-enable the form on failure and stay on the page', () => {
    submit(buildProduct());
    response$.error(new Error('400'));
    fixture.detectChanges();

    expect(form().componentInstance.submitting()).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(notify.success).not.toHaveBeenCalled();
  });

  describe('edit mode (F5)', () => {
    const product = buildProduct({ id: 'trj-crd' });

    beforeEach(() => {
      fixture.componentRef.setInput('product', product);
      fixture.detectChanges();
    });

    it('should show the edit title and pass the product to the form', () => {
      expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Editar Producto');
      expect(form().componentInstance.product()).toBe(product);
    });

    it('should update instead of create and notify on success', () => {
      const edited = { ...product, name: 'Nombre editado' };
      submit(edited);
      response$.next(edited);

      expect(store.update).toHaveBeenCalledWith(edited);
      expect(store.create).not.toHaveBeenCalled();
      expect(notify.success).toHaveBeenCalledWith('Producto actualizado correctamente.');
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    });
  });
});
