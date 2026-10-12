import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { ProductsService } from '@core/service/products/products.service';
import {
  ID_CHECK_DEBOUNCE_MS,
  UniqueProductIdValidator,
  minTodayValidator,
  oneYearAfterValidator,
} from './product.validators';

describe('minTodayValidator', () => {
  const validator = minTodayValidator(() => '2026-10-11');
  const check = (value: string) => validator(new FormControl(value));

  it('should ignore empty values (required handles them)', () => {
    expect(check('')).toBeNull();
  });

  it('should accept today and future dates', () => {
    expect(check('2026-10-11')).toBeNull();
    expect(check('2027-01-01')).toBeNull();
  });

  it('should reject past dates', () => {
    expect(check('2026-10-10')).toEqual({ minToday: true });
  });
});

describe('oneYearAfterValidator', () => {
  const buildGroup = (release: string, revision: string) => {
    const group = new FormGroup({
      date_release: new FormControl(release),
      date_revision: new FormControl(revision, oneYearAfterValidator('date_release')),
    });
    // EL GRUPO SE CREA DESPUES DEL CONTROL, ASI QUE VALIDAMOS OTRA VEZ CUANDO YA TIENE PADRE.
    group.controls.date_revision.updateValueAndValidity();
    return group;
  };

  it('should accept a revision exactly one year after release', () => {
    expect(buildGroup('2026-10-11', '2027-10-11').controls.date_revision.errors).toBeNull();
  });

  it('should reject any other revision date', () => {
    expect(buildGroup('2026-10-11', '2027-10-12').controls.date_revision.errors).toEqual({
      oneYearAfter: true,
    });
  });

  it('should skip validation while either date is missing', () => {
    expect(buildGroup('', '2027-10-11').controls.date_revision.errors).toBeNull();
    expect(buildGroup('2026-10-11', '').controls.date_revision.errors).toBeNull();
  });

  it('should skip validation for a control without parent', () => {
    expect(oneYearAfterValidator('date_release')(new FormControl('2027-10-11'))).toBeNull();
  });
});

describe('UniqueProductIdValidator', () => {
  let validator: UniqueProductIdValidator;
  let api: { verifyId: jest.Mock };

  const run = (value: string): ValidationErrors | null | undefined => {
    let result: ValidationErrors | null | undefined;
    (validator.validate(new FormControl(value)) as Observable<ValidationErrors | null>).subscribe(
      (errors) => (result = errors),
    );
    tick(ID_CHECK_DEBOUNCE_MS);
    return result;
  };

  beforeEach(() => {
    api = { verifyId: jest.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: ProductsService, useValue: api }] });
    validator = TestBed.inject(UniqueProductIdValidator);
  });

  it('should not call the API for an empty or null id', fakeAsync(() => {
    expect(run('  ')).toBeNull();
    expect(run(null as unknown as string)).toBeNull();
    expect(api.verifyId).not.toHaveBeenCalled();
  }));

  it('should flag an id that already exists', fakeAsync(() => {
    api.verifyId.mockReturnValue(of(true));
    expect(run(' trj-crd ')).toEqual({ idTaken: true });
    expect(api.verifyId).toHaveBeenCalledWith('trj-crd');
  }));

  it('should accept an id that does not exist', fakeAsync(() => {
    api.verifyId.mockReturnValue(of(false));
    expect(run('nuevo')).toBeNull();
  }));

  it('should report when the verification cannot be performed', fakeAsync(() => {
    api.verifyId.mockReturnValue(throwError(() => new Error('offline')));
    expect(run('nuevo')).toEqual({ idVerificationFailed: true });
  }));

  it('should wait for the debounce before calling the API', fakeAsync(() => {
    api.verifyId.mockReturnValue(of(false));
    (validator.validate(new FormControl('nuevo')) as Observable<unknown>).subscribe();

    tick(ID_CHECK_DEBOUNCE_MS - 1);
    expect(api.verifyId).not.toHaveBeenCalled();
    tick(1);
    expect(api.verifyId).toHaveBeenCalledTimes(1);
  }));
});
