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
import { requiredText, textLength } from '@shared/validators/text.validators';
import { addYearsIso, todayIso } from '@shared/utils/date.utils';
import { PRODUCT_ERROR_MESSAGES } from '../../validators/product-error-messages';
import {
  UniqueProductIdValidator,
  minTodayValidator,
  oneYearAfterValidator,
} from '../../validators/product.validators';

/**
 * EL MISMO FORMULARIO SIRVE PARA CREAR (F4) Y PARA EDITAR (F5).
 * SI RECIBE UN `product` ESTAMOS EDITANDO: SE LLENAN LOS CAMPOS, SE BLOQUEA EL ID
 * Y YA NO HACE FALTA VERIFICAR QUE SEA UNICO, PORQUE ESE PRODUCTO YA EXISTE.
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
      validators: [requiredText(), textLength(3, 10)],
      asyncValidators: [this.uniqueId],
    }),
    name: ['', [requiredText(), textLength(5, 100)]],
    description: ['', [requiredText(), textLength(10, 200)]],
    logo: ['', requiredText()],
    date_release: ['', [Validators.required, minTodayValidator()]],
    date_revision: ['', [Validators.required, oneYearAfterValidator('date_release')]],
  });

  /** PASAMOS EL ESTADO DEL FORMULARIO A SIGNAL; SIN ESTO, CON ONPUSH EL BOTON NO SE ENTERARIA CUANDO TERMINA LA VALIDACION DEL ID. */
  private readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  protected readonly canSubmit = computed(() => this.status() === 'VALID' && !this.submitting());
  protected readonly idHint = computed(() =>
    this.status() === 'PENDING' && this.form.controls.id.pending ? 'Verificando ID...' : null,
  );

  constructor() {
    // LA FECHA DE REVISION NO LA ESCRIBE EL USUARIO: SIEMPRE ES UN ANIO DESPUES DE LA LIBERACION.
    this.form.controls.date_release.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((release) =>
        this.form.controls.date_revision.setValue(release ? addYearsIso(release, 1) : ''),
      );

    // MANTIENE EL FORMULARIO AL DIA CUANDO CAMBIA EL PRODUCTO QUE NOS PASAN.
    effect(() => this.applyMode(this.product()));
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    // LOS ESPACIOS DE LOS EXTREMOS NO SE GUARDAN: LO QUE VALIDAMOS ES LO QUE SE ENVIA.
    this.submitted.emit({
      ...raw,
      id: raw.id.trim(),
      name: raw.name.trim(),
      description: raw.description.trim(),
      logo: raw.logo.trim(),
    });
  }

  /** EN CREAR DEJA TODO EN BLANCO; EN EDITAR REGRESA A LOS DATOS ORIGINALES DEL PRODUCTO. */
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
      // OJO CON EL ORDEN: PRIMERO QUITAMOS LA VALIDACION DEL ID Y LUEGO CARGAMOS LOS DATOS.
      // AL REVES, reset() LLAMARIA A /verification POR UN ID QUE YA SABEMOS QUE EXISTE.
      id.removeAsyncValidators(this.uniqueId);
      id.disable();
      this.form.reset(product);
    } else {
      id.addAsyncValidators(this.uniqueId);
      id.enable();
    }
  }
}
