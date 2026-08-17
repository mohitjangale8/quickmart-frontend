import { Injectable, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'quickmart_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  private readonly themeSignal = signal<Theme>(this.readInitial());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    this.apply(this.themeSignal());
  }

  toggle(): void {
    this.set(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.themeSignal.set(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable
    }
    this.apply(theme);
  }

  private apply(theme: Theme): void {
    this.doc.documentElement.setAttribute('data-theme', theme);
  }

  private readInitial(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch {
      // ignore
    }
    return 'light';
  }
}