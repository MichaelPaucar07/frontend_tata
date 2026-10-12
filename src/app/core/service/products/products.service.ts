import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { SKIP_ERROR_NOTIFY } from '@core/interceptors/error/error.interceptor';
import { ApiListResponse, ApiResponse } from '@core/models/api/api-response';
import { Product, ProductUpdate } from '@core/models/product/product';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<ApiListResponse<Product>>(this.baseUrl).pipe(map((res) => res.data));
  }

  create(product: Product): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.baseUrl, product).pipe(map((res) => res.data));
  }

  update(id: string, changes: ProductUpdate): Observable<Product> {
    return this.http
      .put<ApiResponse<ProductUpdate>>(`${this.baseUrl}/${encodeURIComponent(id)}`, changes)
      .pipe(map((res) => ({ id, ...res.data })));
  }

  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verification/${encodeURIComponent(id)}`, {
      context: new HttpContext().set(SKIP_ERROR_NOTIFY, true),
    });
  }
}
