import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PrincipalComponent } from './principal.component';

describe('PrincipalComponent', () => {
  let fixture: ComponentFixture<PrincipalComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PrincipalComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(PrincipalComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should render the brand linking to the products list', () => {
    const brand = element.querySelector<HTMLAnchorElement>('.brand');
    expect(brand?.textContent).toContain('BANCO');
    expect(brand?.getAttribute('href')).toBe('/products');
  });

  it('should render the router outlet inside main', () => {
    expect(element.querySelector('main router-outlet')).not.toBeNull();
  });
});
