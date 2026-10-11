import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductLogoComponent } from './product-logo.component';

describe('ProductLogoComponent', () => {
  let fixture: ComponentFixture<ProductLogoComponent>;
  const el = (): HTMLElement => fixture.nativeElement;

  const render = (src: string, name = 'Juan García'): void => {
    fixture.componentRef.setInput('src', src);
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductLogoComponent] });
    fixture = TestBed.createComponent(ProductLogoComponent);
  });

  it('should render the image when a src is provided', () => {
    render('https://example.com/logo.png');
    const img = el().querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://example.com/logo.png');
    expect(img?.getAttribute('alt')).toBe('Logo de Juan García');
  });

  it('should show initials when the src is empty', () => {
    render('');
    expect(el().querySelector('img')).toBeNull();
    expect(el().querySelector('.logo--fallback')?.textContent?.trim()).toBe('JG');
  });

  it('should fall back to initials when the image fails to load', () => {
    render('broken.png');
    el().querySelector('img')?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(el().querySelector('img')).toBeNull();
    expect(el().querySelector('.logo--fallback')).not.toBeNull();
  });

  it('should retry the image when the src changes', () => {
    render('broken.png');
    el().querySelector('img')?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    render('https://example.com/ok.png');

    expect(el().querySelector('img')?.getAttribute('src')).toBe('https://example.com/ok.png');
  });
});
