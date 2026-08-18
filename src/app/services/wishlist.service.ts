import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models';

const STORAGE_KEY = 'quickmart_wishlist';

export interface WishlistItem {
  productId: number;
  name: string;
  brand?: string;
  price: number;
  imageUrl?: string;
  addedAt: string;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly itemsSignal = signal<WishlistItem[]>(this.readStored());

  readonly items = this.itemsSignal.asReadonly();
  readonly count = computed(() => this.itemsSignal().length);
  private readonly ids = computed(() => new Set(this.itemsSignal().map((i) => i.productId)));

  has(productId: number): boolean {
    return this.ids().has(productId);
  }

  toggle(product: Product): void {
    if (this.has(product.id)) {
      this.remove(product.id);
    } else {
      this.add(product);
    }
  }

  add(product: Product): void {
    if (this.has(product.id)) return;
    const item: WishlistItem = {
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      imageUrl: product.imageUrl,
      addedAt: new Date().toISOString()
    };
    this.persist([...this.itemsSignal(), item]);
  }

  remove(productId: number): void {
    this.persist(this.itemsSignal().filter((i) => i.productId !== productId));
  }

  clear(): void {
    this.persist([]);
  }

  private persist(items: WishlistItem[]): void {
    this.itemsSignal.set(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable - wishlist still works in-memory for this session
    }
  }

  private readStored(): WishlistItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
    } catch {
      return [];
    }
  }
}
