import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotifyService } from '@core/service/ui/notify/notify.service';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let notify: NotifyService;

  const toasts = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.toast'));

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({ imports: [ToastComponent] });
    fixture = TestBed.createComponent(ToastComponent);
    notify = TestBed.inject(NotifyService);
  });

  afterEach(() => jest.useRealTimers());

  it('should render nothing when there are no notifications', () => {
    fixture.detectChanges();
    expect(toasts().length).toBe(0);
  });

  it('should render each notification with its type and role', () => {
    notify.error('Falló');
    notify.success('Guardado');
    fixture.detectChanges();

    const [error, success] = toasts();
    expect(error.textContent).toContain('Falló');
    expect(error.classList).toContain('toast--error');
    expect(error.getAttribute('role')).toBe('alert');
    expect(success.classList).toContain('toast--success');
    expect(success.getAttribute('role')).toBe('status');
  });

  it('should dismiss a notification when clicking close', () => {
    notify.info('Hola');
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.toast__close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(toasts().length).toBe(0);
  });
});
