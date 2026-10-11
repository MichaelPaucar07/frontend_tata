import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '@core/models/product/product';
import { ProductLogoComponent } from '../product-logo/product-logo.component';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [DatePipe, ProductLogoComponent],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTableComponent {
  readonly products = input.required<Product[]>();
  readonly emptyMessage = input('No hay productos registrados.');
}
