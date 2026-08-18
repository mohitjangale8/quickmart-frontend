import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page, Product, ProductRequest, Review, ReviewRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/products`;

  list(
    options: { page?: number; size?: number; q?: string; category?: string; brand?: string } = {}
  ): Observable<Page<Product>> {
    let params = new HttpParams()
      .set('page', options.page ?? 0)
      .set('size', options.size ?? 50);
    if (options.q) params = params.set('q', options.q);
    if (options.category) params = params.set('category', options.category);
    if (options.brand) params = params.set('brand', options.brand);
    return this.http.get<Page<Product>>(this.base, { params });
  }

  brands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/brands`);
  }

  reviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.base}/${productId}/reviews`);
  }

  addReview(productId: number, payload: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.base}/${productId}/reviews`, payload);
  }

  get(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(payload: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.base, payload);
  }

  update(id: number, payload: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, payload);
  }

  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${environment.apiUrl}/api/uploads/product-image`, form);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
