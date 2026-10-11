import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductSearchComponent, SEARCH_DEBOUNCE_MS } from './product-search.component';

describe('ProductSearchComponent', () => {
  let fixture: ComponentFixture<ProductSearchComponent>;
  let input: HTMLInputElement;
  let emitted: string[];

  const type = (value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductSearchComponent] });
    fixture = TestBed.createComponent(ProductSearchComponent);
    emitted = [];
    fixture.componentInstance.searchChange.subscribe((term) => emitted.push(term));
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  it('should reflect the provided value', () => {
    fixture.componentRef.setInput('value', 'tarjeta');
    fixture.detectChanges();
    expect(input.value).toBe('tarjeta');
  });

  it('should emit only once after the user stops typing', fakeAsync(() => {
    type('t');
    type('ta');
    type('tar');
    tick(SEARCH_DEBOUNCE_MS - 1);
    expect(emitted).toEqual([]);

    tick(1);
    expect(emitted).toEqual(['tar']);
  }));

  it('should not emit the same term twice in a row', fakeAsync(() => {
    type('tar');
    tick(SEARCH_DEBOUNCE_MS);
    type('tarj');
    type('tar');
    tick(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual(['tar']);
  }));
});
