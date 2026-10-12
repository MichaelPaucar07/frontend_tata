import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { ErrorMessages, getControlErrorMessage } from '@shared/utils/form-errors';

/**
 * ETIQUETA + CAMPO + MENSAJE DE ERROR, COMO EN D2.
 * EL ERROR SOLO APARECE CUANDO EL USUARIO YA TOCO EL CAMPO, NO APENAS ENTRA A LA PANTALLA.
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'field',
    '[class.field--error]': '!!errorMessage()',
  },
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly control = input.required<AbstractControl>();
  readonly messages = input<ErrorMessages>({});
  readonly hint = input<string | null>(null);

  /**
   * LOS FORMULARIOS REACTIVOS NO SON SIGNALS. ESCUCHAMOS `control.events` (NUEVO EN
   * ANGULAR 18) PARA QUE EL MENSAJE DE ERROR SE ACTUALICE AUNQUE USEMOS ONPUSH.
   */
  private readonly controlEvent = toSignal(
    toObservable(this.control).pipe(switchMap((control) => control.events.pipe(startWith(null)))),
  );

  protected readonly errorMessage = computed(() => {
    this.controlEvent();
    const control = this.control();
    if (!control.invalid || !(control.touched || control.dirty)) {
      return null;
    }
    return getControlErrorMessage(control.errors, this.messages());
  });

  protected readonly errorId = computed(() => `${this.fieldId()}-error`);
}
