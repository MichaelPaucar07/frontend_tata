import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Product } from '@core/models/product/product';
import { buildProduct } from '../../testing/product.fixtures';
import { ProductActionsMenuComponent } from './product-actions-menu.component';

describe('ProductActionsMenuComponent', () => {
  let fixture: ComponentFixture<ProductActionsMenuComponent>;
  const product = buildProduct();
  const el = (): HTMLElement => fixture.nativeElement;
  const trigger = () => el().querySelector<HTMLButtonElement>('.trigger')!;
  const menu = () => el().querySelector('[role="menu"]');

  const open = (): void => {
    trigger().click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductActionsMenuComponent] });
    fixture = TestBed.createComponent(ProductActionsMenuComponent);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    document.body.appendChild(el());
  });

  afterEach(() => el().remove());

  it('should start closed with an accessible trigger', () => {
    expect(menu()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().getAttribute('aria-label')).toBe(`Acciones para ${product.name}`);
  });

  it('should open below the trigger and toggle closed on second click', () => {
    open();
    expect(menu()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect((menu() as HTMLElement).style.top).toMatch(/px$/);

    open();
    expect(menu()).toBeNull();
  });

  it('should emit edit with the product and close', () => {
    const emitted: Product[] = [];
    fixture.componentInstance.edit.subscribe((p) => emitted.push(p));
    open();

    el().querySelector<HTMLButtonElement>('[role="menuitem"]')!.click();
    fixture.detectChanges();

    expect(emitted).toEqual([product]);
    expect(menu()).toBeNull();
  });

  it('should close when clicking outside', () => {
    open();
    document.body.click();
    fixture.detectChanges();
    expect(menu()).toBeNull();
  });

  it('should stay open when clicking inside', () => {
    open();
    (menu() as HTMLElement).click();
    fixture.detectChanges();
    expect(menu()).not.toBeNull();
  });

  it.each([
    ['Escape', () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))],
    ['resize', () => window.dispatchEvent(new Event('resize'))],
    ['scroll', () => window.dispatchEvent(new Event('scroll'))],
  ])('should close on %s', (_, trigger) => {
    open();
    trigger();
    fixture.detectChanges();
    expect(menu()).toBeNull();
  });
});
