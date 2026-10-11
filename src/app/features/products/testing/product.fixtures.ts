import { Product } from '@core/models/product/product';

/** Test data builders shared by the products feature specs. */
export function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://example.com/visa.jpg',
    date_release: '2025-02-01',
    date_revision: '2026-02-01',
    ...overrides,
  };
}

export function buildProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) =>
    buildProduct({ id: `prod-${i + 1}`, name: `Producto ${i + 1}` }),
  );
}
