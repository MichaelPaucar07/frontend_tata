import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '@core/models/product/product';
import { ProductListFooterComponent } from '../../components/product-list-footer/product-list-footer.component';
import { ProductSearchComponent } from '../../components/product-search/product-search.component';
import { ProductTableComponent } from '../../components/product-table/product-table.component';
import { PageSize, ProductsStore } from '../../state/products.store';

/**
 * PAGINA DEL LISTADO (F1, F2, F3) Y PUNTO DE ENTRADA PARA EDITAR (F5).
 * NO TIENE LOGICA PROPIA: SOLO CONECTA EL STORE CON LOS COMPONENTES.
 */
@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [RouterLink, ProductSearchComponent, ProductTableComponent, ProductListFooterComponent],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPageComponent implements OnInit {
  protected readonly store = inject(ProductsStore);
  private readonly router = inject(Router);

  protected readonly showLoading = computed(
    () => this.store.loading() && this.store.products().length === 0,
  );
  protected readonly showError = computed(
    () => this.store.error() && this.store.products().length === 0,
  );
  protected readonly emptyMessage = computed(() =>
    this.store.searchTerm().trim()
      ? `No se encontraron productos para "${this.store.searchTerm().trim()}".`
      : 'No hay productos registrados.',
  );

  ngOnInit(): void {
    this.store.load();
  }

  protected onSearch(term: string): void {
    this.store.setSearchTerm(term);
  }

  protected onPageSizeChange(size: PageSize): void {
    this.store.setPageSize(size);
  }

  protected onEdit(product: Product): void {
    this.router.navigate(['/products', product.id, 'edit']);
  }

  protected retry(): void {
    this.store.load();
  }
}
