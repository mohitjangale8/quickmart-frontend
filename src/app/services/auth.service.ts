import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, Role } from '../models';

const TOKEN_KEY = 'quickmart_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly authState = signal<AuthResponse | null>(this.readStored());

  readonly user = computed(() => this.authState());
  readonly token = computed(() => this.authState()?.token ?? null);
  readonly isLoggedIn = computed(() => !!this.authState());
  readonly role = computed<Role | null>(() => this.authState()?.role ?? null);

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  me(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${environment.apiUrl}/api/auth/me`);
  }

  updateProfile(name: string): Observable<AuthResponse> {
    return this.http
      .put<AuthResponse>(`${environment.apiUrl}/api/auth/profile`, { name })
      .pipe(tap((res) => this.mergeProfile({ name: res.name })));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/auth/password`, {
      currentPassword,
      newPassword
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.authState.set(null);
    this.router.navigate(['/login']);
  }

  private mergeProfile(partial: Partial<Pick<AuthResponse, 'name' | 'email'>>): void {
    const current = this.authState();
    if (!current) return;
    const updated = { ...current, ...partial };
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(updated));
    } catch {
      // storage unavailable
    }
    this.authState.set(updated);
  }

  private setSession(res: AuthResponse): void {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(res));
    } catch {
      // storage unavailable (private mode / quota) - session still works in-memory
    }
    this.authState.set(res);
  }

  private readStored(): AuthResponse | null {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }
}
