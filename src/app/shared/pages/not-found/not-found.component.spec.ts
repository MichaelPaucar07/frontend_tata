import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  it('should show the message and a link back to the list', () => {
    TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Página no encontrada');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/products');
  });
});
