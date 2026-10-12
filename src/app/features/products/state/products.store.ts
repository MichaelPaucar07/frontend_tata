import { Injectable, computed, inject, signal } from "@angular/core";
import { Observable, map, of, tap } from "rxjs";
import { Product } from "@core/models/product/product";
import { ProductsService } from "@core/service/products/products.service";
import { normalizeText } from "@shared/utils/text.utils";

export const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
export type PageSize = typeof PAGE_SIZE_OPTIONS[number];


@Injectable({ providedIn: "root" })
export class ProductsStore {
  private readonly api = inject(ProductsService);

  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal(false);
  private readonly _searchTerm = signal("");
  private readonly _pageSize = signal<PageSize>(PAGE_SIZE_OPTIONS[0]);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

  /** F2: BUSCA EN NOMBRE Y DESCRIPCION SIN IMPORTAR MAYUSCULAS NI TILDES. */
  readonly filtered = computed(() => {
    const term = normalizeText(this._searchTerm());
    const products = this._products();
    if (!term) {
      return products;
    }
    return products.filter(
      (p) =>
        normalizeText(p.name).includes(term) ||
        normalizeText(p.description).includes(term)
    );
  });

  /** F3: LAS FILAS QUE SE VEN EN LA TABLA SEGUN LA CANTIDAD ELEGIDA. */
  readonly visible = computed(() => this.filtered().slice(0, this._pageSize()));

  /** F3: EL NUMERO QUE SE MUESTRA COMO "N RESULTADOS". */
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
        // EL TOAST DE ERROR YA LO MUESTRA EL INTERCEPTOR; AQUI SOLO DEJAMOS LA PANTALLA EN UN ESTADO CORRECTO.
        this._error.set(true);
        this._loading.set(false);
      },
    });
  }

  /** F4: GUARDA EL PRODUCTO Y LO SUMA A LA LISTA, ASI APARECE AL VOLVER SIN TENER QUE RECARGAR. */
  create(product: Product): Observable<Product> {
    return this.api
      .create(product)
      .pipe(
        tap((created) => this._products.update((list) => [...list, created]))
      );
  }

  /** F5: SI EL PRODUCTO YA ESTA EN LA LISTA LO TOMAMOS DE AHI; SI NO, PEDIMOS LA LISTA A LA API. */
  findById(id: string): Observable<Product | undefined> {
    const cached = this._products().find((p) => p.id === id);
    if (cached) {
      return of(cached);
    }
    return this.api.getAll().pipe(
      tap((products) => this._products.set(products)),
      map((products) => products.find((p) => p.id === id))
    );
  }

  /** F5: GUARDA LOS CAMBIOS Y ACTUALIZA ESE PRODUCTO EN LA LISTA. */
  update(product: Product): Observable<Product> {
    const { id, ...changes } = product;
    return this.api
      .update(id, changes)
      .pipe(
        tap((updated) =>
          this._products.update((list) =>
            list.map((p) => (p.id === id ? updated : p))
          )
        )
      );
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  setPageSize(size: PageSize): void {
    this._pageSize.set(size);
  }
}
