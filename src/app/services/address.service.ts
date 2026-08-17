import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Address, AddressRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/addresses`;

  list(): Observable<Address[]> {
    return this.http.get<Address[]>(this.base);
  }

  get(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.base}/${id}`);
  }

  create(payload: AddressRequest): Observable<Address> {
    return this.http.post<Address>(this.base, payload);
  }

  update(id: number, payload: AddressRequest): Observable<Address> {
    return this.http.put<Address>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
