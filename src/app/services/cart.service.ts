import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CartResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/cart`;

  private readonly state = signal<CartResponse>({ buyerId: 0, items: [], subtotal: 0, totalCount: 0 });

  readonly items = computed(() => this.state().items);
  readonly count = computed(() => this.state().totalCount);
  readonly subtotal = computed(() => this.state().subtotal);

  load(): void {
    this.http.get<CartResponse>(this.base).subscribe({
      next: (cart) => this.state.set(cart),
      error: () => this.state.set({ buyerId: 0, items: [], subtotal: 0, totalCount: 0 })
    });
  }

  reset(): void {
    this.state.set({ buyerId: 0, items: [], subtotal: 0, totalCount: 0 });
  }

  add(productId: number, quantity: number): void {
    this.http.post<CartResponse>(`${this.base}/items`, { productId, quantity }).subscribe({
      next: (cart) => this.state.set(cart)
    });
  }

  setQuantity(itemId: number, quantity: number): void {
    this.http.put<CartResponse>(`${this.base}/items/${itemId}`, { quantity }).subscribe({
      next: (cart) => this.state.set(cart)
    });
  }

  remove(itemId: number): void {
    this.http.delete<CartResponse>(`${this.base}/items/${itemId}`).subscribe({
      next: (cart) => this.state.set(cart)
    });
  }

  clear(): void {
    this.http.delete<CartResponse>(this.base).subscribe({
      next: (cart) => this.state.set(cart)
    });
  }
}