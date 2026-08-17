import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CheckoutResponse, PaymentResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/payments`;

  checkout(orderId: number): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.base}/checkout`, { orderId });
  }

  confirm(paymentId: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.base}/${paymentId}/confirm`, {});
  }
}
