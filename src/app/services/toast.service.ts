import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  private nextId = 1;

  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: Toast['type'] = 'info'): void {
    const id = this.nextId++;
    this.toastsSignal.update((t) => [...t, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 2800);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    this.toastsSignal.update((t) => t.filter((toast) => toast.id !== id));
  }
}