import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buildProduct, buildProducts } from '../../testing/product.fixtures';
import { ProductTableComponent } from './product-table.component';

describe('ProductTableComponent', () => {
  let fixture: ComponentFixture<ProductTableComponent>;
  const rows = (): HTMLTableRowElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductTableComponent] });
    fixture = TestBed.createComponent(ProductTableComponent);
  });

  it('should render one row per product', () => {
    fixture.componentRef.setInput('products', buildProducts(3));
    fixture.detectChanges();
    expect(rows().length).toBe(3);
  });

  it('should render name, description and dates formatted as dd/MM/yyyy', () => {
    fixture.componentRef.setInput('products', [
      buildProduct({ date_release: '2025-02-01', date_revision: '2026-02-01' }),
    ]);
    fixture.detectChanges();

    const cells = Array.from(rows()[0].querySelectorAll('td')).map((td) => td.textContent?.trim());
    expect(cells.slice(1)).toEqual([
      'Tarjetas de Crédito',
      'Tarjeta de consumo bajo la modalidad de crédito',
      '01/02/2025',
      '01/02/2026',
    ]);
  });

  it('should render the empty message when there are no products', () => {
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('emptyMessage', 'Sin resultados');
    fixture.detectChanges();

    expect(rows().length).toBe(1);
    expect(rows()[0].textContent).toContain('Sin resultados');
  });
});
