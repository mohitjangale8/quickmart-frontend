import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, OrderCreateRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/orders`;

  create(payload: OrderCreateRequest): Observable<Order> {
    return this.http.post<Order>(this.base, payload);
  }

  myOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/me`);
  }

  get(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  ship(id: number): Observable<Order> {
    return this.http.post<Order>(`${this.base}/${id}/ship`, {});
  }
}
