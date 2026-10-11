import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AsyncValidatorFn, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '@core/models/product/product';
import { FormFieldComponent } from '@shared/form-field/form-field.component';
import { addYearsIso, todayIso } from '@shared/utils/date.utils';
import { PRODUCT_ERROR_MESSAGES } from '../../validators/product-error-messages';
import {
  UniqueProductIdValidator,
  minTodayValidator,
  oneYearAfterValidator,
} from '../../validators/product.validators';

/**
 * Create (F4) / edit (F5) form (D2).
 * Edit mode = a `product` is provided: values are pre-filled, the id is disabled
 * and the uniqueness check is removed (the id already exists by definition).
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly uniqueIdValidator = inject(UniqueProductIdValidator);
  private readonly uniqueId: AsyncValidatorFn = this.uniqueIdValidator.validate.bind(
    this.uniqueIdValidator,
  );

  readonly product = input<Product | null>(null);
  readonly submitting = input(false);
  readonly submitted = output<Product>();

  protected readonly messages = PRODUCT_ERROR_MESSAGES;
  protected readonly minReleaseDate = todayIso();

  readonly form = this.fb.group({
    id: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
      asyncValidators: [this.uniqueId],
    }),
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', Validators.required],
    date_release: ['', [Validators.required, minTodayValidator()]],
    date_revision: ['', [Validators.required, oneYearAfterValidator('date_release')]],
  });

  /** Bridges reactive-form status into a signal so OnPush reacts to async validation. */
  private readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  protected readonly canSubmit = computed(() => this.status() === 'VALID' && !this.submitting());
  protected readonly idHint = computed(() =>
    this.status() === 'PENDING' && this.form.controls.id.pending ? 'Verificando ID...' : null,
  );

  constructor() {
    // Revision is derived: always exactly one year after the release date.
    this.form.controls.date_release.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((release) =>
        this.form.controls.date_revision.setValue(release ? addYearsIso(release, 1) : ''),
      );

    // Sync the (non-signal) reactive form with the `product` input.
    effect(() => this.applyMode(this.product()));
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }

  /** Create: blank form. Edit: back to the loaded product. */
  protected onReset(): void {
    const product = this.product();
    if (product) {
      this.form.reset(product);
    } else {
      this.form.reset();
    }
  }

  private applyMode(product: Product | null): void {
    const id = this.form.controls.id;
    if (product) {
      // Order matters: drop the uniqueness check BEFORE loading values,
      // otherwise reset() would hit /verification for an id we know exists.
      id.removeAsyncValidators(this.uniqueId);
      id.disable();
      this.form.reset(product);
    } else {
      id.addAsyncValidators(this.uniqueId);
      id.enable();
    }
  }
}
