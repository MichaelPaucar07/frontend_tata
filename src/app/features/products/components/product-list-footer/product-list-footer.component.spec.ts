import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageSize } from '../../state/products.store';
import { ProductListFooterComponent } from './product-list-footer.component';

describe('ProductListFooterComponent', () => {
  let fixture: ComponentFixture<ProductListFooterComponent>;
  const el = (): HTMLElement => fixture.nativeElement;

  const render = (total: number, pageSize: PageSize = 5): void => {
    fixture.componentRef.setInput('total', total);
    fixture.componentRef.setInput('pageSize', pageSize);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductListFooterComponent] });
    fixture = TestBed.createComponent(ProductListFooterComponent);
  });

  it('should show the results count with correct plural', () => {
    render(12);
    expect(el().querySelector('.results')?.textContent?.trim()).toBe('12 Resultados');

    render(1);
    expect(el().querySelector('.results')?.textContent?.trim()).toBe('1 Resultado');
  });

  it('should offer 5, 10 and 20 with the current one selected', () => {
    render(0, 10);
    const select: HTMLSelectElement = el().querySelector('select')!;

    expect(Array.from(select.options).map((o) => o.value)).toEqual(['5', '10', '20']);
    expect(select.value).toBe('10');
  });

  it('should emit the new page size as a number', () => {
    render(0);
    const emitted: PageSize[] = [];
    fixture.componentInstance.pageSizeChange.subscribe((size) => emitted.push(size));

    const select: HTMLSelectElement = el().querySelector('select')!;
    select.value = '20';
    select.dispatchEvent(new Event('change'));

    expect(emitted).toEqual([20]);
  });
});
