import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldComponent } from './form-field.component';

@Component({
  standalone: true,
  imports: [FormFieldComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-field label="Nombre" fieldId="name" [control]="control" [messages]="messages" [hint]="hint()">
      <input id="name" [formControl]="control" />
    </app-form-field>
  `,
})
class HostComponent {
  control = new FormControl('', [Validators.required, Validators.minLength(5)]);
  messages = { minlength: 'Muy corto' };
  hint = signal<string | null>(null);
}

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const error = () => el().querySelector('.field__error');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should link the label to the projected control', () => {
    expect(el().querySelector('label')?.getAttribute('for')).toBe('name');
    expect(el().querySelector('label')?.textContent).toBe('Nombre');
  });

  it('should hide errors until the control is touched', () => {
    expect(error()).toBeNull();

    host.control.markAsTouched();
    fixture.detectChanges();

    expect(error()?.textContent).toBe('Este campo es requerido!');
    expect(el().querySelector('app-form-field')?.classList).toContain('field--error');
  });

  it('should use custom messages and clear the error once valid', () => {
    const input: HTMLInputElement = el().querySelector('input')!;
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(error()?.textContent).toBe('Muy corto');

    input.value = 'abcdef';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(error()).toBeNull();
    expect(el().querySelector('app-form-field')?.classList).not.toContain('field--error');
  });

  it('should show the hint when there is no error', () => {
    host.hint.set('Verificando...');
    fixture.detectChanges();
    expect(el().querySelector('.field__hint')?.textContent).toBe('Verificando...');
  });
});
