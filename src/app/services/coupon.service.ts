import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CouponValidateRequest, CouponValidateResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/coupons`;

  validate(payload: CouponValidateRequest): Observable<CouponValidateResponse> {
    return this.http.post<CouponValidateResponse>(`${this.base}/validate`, payload);
  }
}
