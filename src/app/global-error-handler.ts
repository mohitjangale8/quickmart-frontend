import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { ToastService } from './services/toast.service';

/**
 * Catches errors that escape component templates/event handlers/change detection
 * (the "error boundary" for a single-page Angular app - there's no per-component
 * try/catch equivalent for template rendering). Without this, one bad render
 * throws Angular into a broken, blank state; with it, the user sees a toast and
 * the rest of the app keeps working.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly zone = inject(NgZone);
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    console.error('Unhandled application error:', error);
    this.zone.run(() => {
      this.toast.error('Something went wrong. Please try again.');
    });
  }
}
