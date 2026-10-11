import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '@core/models/product/product';
import { FormFieldComponent } from '@shared/form-field/form-field.component';
import { addYearsIso, todayIso } from '@shared/utils/date.utils';
import { PRODUCT_ERROR_MESSAGES } from '../../validators/product-error-messages';
import {
  UniqueProductIdValidator,
  minTodayValidator,
  oneYearAfterValidator,
} from '../../validators/product.validators';

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

  readonly submitting = input(false);
  readonly submitted = output<Product>();

  protected readonly messages = PRODUCT_ERROR_MESSAGES;
  protected readonly minReleaseDate = todayIso();

  readonly form = this.fb.group({
    id: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
      asyncValidators: [this.uniqueIdValidator.validate.bind(this.uniqueIdValidator)],
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
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }

  protected onReset(): void {
    this.form.reset();
  }
}
