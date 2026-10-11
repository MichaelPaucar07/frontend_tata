import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { Product } from '@core/models/product/product';
import { addYearsIso, todayIso } from '@shared/utils/date.utils';
import { UniqueProductIdValidator } from '../../validators/product.validators';
import { ProductFormComponent } from './product-form.component';

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;
  let idValidation: jest.Mock<Observable<ValidationErrors | null>>;
  const el = (): HTMLElement => fixture.nativeElement;
  const submitButton = () => el().querySelector<HTMLButtonElement>('button[type="submit"]')!;

  const release = todayIso();
  const validProduct: Product = {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://example.com/visa.jpg',
    date_release: release,
    date_revision: addYearsIso(release, 1),
  };

  const type = (id: string, value: string): void => {
    const input = el().querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };

  const fillValid = (): void => {
    type('id', validProduct.id);
    type('name', validProduct.name);
    type('description', validProduct.description);
    type('logo', validProduct.logo);
    type('date_release', validProduct.date_release);
  };

  const errorOf = (id: string) =>
    el().querySelector(`#${id}`)?.closest('app-form-field')?.querySelector('.field__error')
      ?.textContent;

  beforeEach(() => {
    idValidation = jest.fn().mockReturnValue(of(null));
    TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [{ provide: UniqueProductIdValidator, useValue: { validate: idValidation } }],
    });
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should start invalid with the submit button disabled', () => {
    expect(component.form.invalid).toBe(true);
    expect(submitButton().disabled).toBe(true);
  });

  it('should auto-calculate the revision date one year after release', () => {
    type('date_release', '2030-05-10');
    expect(component.form.controls.date_revision.value).toBe('2031-05-10');

    type('date_release', '');
    expect(component.form.controls.date_revision.value).toBe('');
  });

  it('should render the revision date as read-only', () => {
    expect(el().querySelector('#date_revision')?.hasAttribute('readonly')).toBe(true);
  });

  describe('field validations (F4)', () => {
    it('should show "required" after touching an empty field', () => {
      type('description', '');
      expect(errorOf('description')).toBe('Este campo es requerido!');
    });

    it.each([
      ['id', 'ab', 'Debe tener mínimo 3 caracteres.'],
      ['id', 'abcdefghijk', 'Debe tener máximo 10 caracteres.'],
      ['name', 'abcd', 'Debe tener mínimo 5 caracteres.'],
      ['name', 'a'.repeat(101), 'Debe tener máximo 100 caracteres.'],
      ['description', 'corta', 'Debe tener mínimo 10 caracteres.'],
      ['description', 'a'.repeat(201), 'Debe tener máximo 200 caracteres.'],
    ])('%s = "%s" → %s', (id, value, message) => {
      type(id, value);
      expect(errorOf(id)).toBe(message);
    });

    it('should reject a release date in the past', () => {
      type('date_release', '2000-01-01');
      expect(errorOf('date_release')).toBe('La fecha debe ser igual o mayor a la fecha actual.');
    });

    it('should show the duplicated id message from the async validator', () => {
      idValidation.mockReturnValue(of({ idTaken: true }));
      type('id', 'trj-crd');
      expect(errorOf('id')).toBe('ID no válido! Ya existe un producto con este ID.');
    });

    it('should not call the async validator while sync rules fail', () => {
      type('id', 'ab');
      expect(idValidation).not.toHaveBeenCalled();
    });
  });

  it('should enable submit and emit the product when the form is valid', () => {
    const emitted: Product[] = [];
    component.submitted.subscribe((p) => emitted.push(p));

    fillValid();
    expect(submitButton().disabled).toBe(false);

    submitButton().click();
    expect(emitted).toEqual([validProduct]);
  });

  it('should keep submit disabled and show "Enviando..." while submitting', () => {
    fillValid();
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();

    expect(submitButton().disabled).toBe(true);
    expect(submitButton().textContent?.trim()).toBe('Enviando...');
  });

  it('should mark everything as touched instead of emitting when invalid', () => {
    const emitted: Product[] = [];
    component.submitted.subscribe((p) => emitted.push(p));

    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([]);
    expect(errorOf('name')).toBe('Este campo es requerido!');
  });

  it('should clear values and errors on "Reiniciar"', () => {
    fillValid();
    type('name', 'abc');

    el().querySelector<HTMLButtonElement>('button[type="button"]')!.click();
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    });
    expect(el().querySelectorAll('.field__error').length).toBe(0);
  });

  describe('edit mode (F5)', () => {
    const editProduct = (): void => {
      fixture.componentRef.setInput('product', validProduct);
      fixture.detectChanges();
    };

    it('should pre-fill the form and disable the id', () => {
      editProduct();

      expect(component.form.getRawValue()).toEqual(validProduct);
      expect(component.form.controls.id.disabled).toBe(true);
      expect(el().querySelector<HTMLInputElement>('#id')!.disabled).toBe(true);
    });

    it('should not run the id uniqueness check', () => {
      idValidation.mockClear();
      editProduct();
      type('name', 'Nombre editado');

      expect(idValidation).not.toHaveBeenCalled();
      expect(submitButton().disabled).toBe(false);
    });

    it('should keep the same validations as create', () => {
      editProduct();
      type('description', 'corta');
      expect(errorOf('description')).toBe('Debe tener mínimo 10 caracteres.');
      expect(submitButton().disabled).toBe(true);
    });

    it('should emit the product including the disabled id', () => {
      const emitted: Product[] = [];
      component.submitted.subscribe((p) => emitted.push(p));
      editProduct();
      type('name', 'Nombre editado');

      submitButton().click();

      expect(emitted).toEqual([{ ...validProduct, name: 'Nombre editado' }]);
    });

    it('should restore the loaded product on "Reiniciar"', () => {
      editProduct();
      type('name', 'Otro nombre');

      el().querySelector<HTMLButtonElement>('button[type="button"]')!.click();

      expect(component.form.getRawValue()).toEqual(validProduct);
    });

    it('should go back to create mode when the product is cleared', () => {
      editProduct();
      fixture.componentRef.setInput('product', null);
      fixture.detectChanges();

      expect(component.form.controls.id.enabled).toBe(true);
      type('id', 'nuevo-id');
      expect(idValidation).toHaveBeenCalled();
    });
  });
});
