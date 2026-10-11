import { Injectable, computed, inject, signal } from '@angular/core';
import { Product } from '@core/models/product/product';
import { ProductsService } from '@core/service/products/products.service';
import { normalizeText } from '@shared/utils/text.utils';

export const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

/**
 * Single source of truth for the products feature.
 * Root-provided so the cached list survives navigation (list → form → list)
 * and can be reused by the edit flow.
 */
@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private readonly api = inject(ProductsService);

  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal(false);
  private readonly _searchTerm = signal('');
  private readonly _pageSize = signal<PageSize>(PAGE_SIZE_OPTIONS[0]);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

  /** F2: case- and accent-insensitive match on name and description. */
  readonly filtered = computed(() => {
    const term = normalizeText(this._searchTerm());
    const products = this._products();
    if (!term) {
      return products;
    }
    return products.filter(
      (p) => normalizeText(p.name).includes(term) || normalizeText(p.description).includes(term),
    );
  });

  /** F3: rows actually rendered. */
  readonly visible = computed(() => this.filtered().slice(0, this._pageSize()));

  /** F3: "N Resultados". */
  readonly total = computed(() => this.filtered().length);

  load(): void {
    this._loading.set(true);
    this._error.set(false);
    this.api.getAll().subscribe({
      next: (products) => {
        this._products.set(products);
        this._loading.set(false);
      },
      error: () => {
        // User-facing message is shown by the error interceptor; keep UI state consistent.
        this._error.set(true);
        this._loading.set(false);
      },
    });
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  setPageSize(size: PageSize): void {
    this._pageSize.set(size);
  }
}
