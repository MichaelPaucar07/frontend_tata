import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { ErrorMessages, getControlErrorMessage } from '@shared/utils/form-errors';

/**
 * Label + projected control + error message (D2 error state).
 * Shows the error once the user interacted with the control (touched or dirty).
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
   * Reactive forms are not signal-based: `control.events` (Angular 18) emits on every
   * value/status/touched change, which re-evaluates the computed below under OnPush.
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
