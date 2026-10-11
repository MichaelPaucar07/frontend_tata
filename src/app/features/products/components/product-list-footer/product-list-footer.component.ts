import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PAGE_SIZE_OPTIONS, PageSize } from '../../state/products.store';

@Component({
  selector: 'app-product-list-footer',
  standalone: true,
  templateUrl: './product-list-footer.component.html',
  styleUrl: './product-list-footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListFooterComponent {
  readonly total = input.required<number>();
  readonly pageSize = input.required<PageSize>();
  readonly pageSizeChange = output<PageSize>();

  protected readonly options = PAGE_SIZE_OPTIONS;

  protected onChange(event: Event): void {
    this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value) as PageSize);
  }
}
