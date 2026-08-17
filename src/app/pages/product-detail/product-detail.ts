import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models';
import { discountPercent, imageFor, mrpOf, rupees } from '../../utils';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail {
  private readonly productsApi = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly orderApi = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly product = signal<Product | null>(null);
  readonly qty = signal(1);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productsApi.get(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Product not found');
        this.loading.set(false);
      }
    });
  }

  image(): string | null {
    const p = this.product();
    return p ? imageFor(p) : null;
  }

  mrp(): number {
    const p = this.product();
    return p ? mrpOf(p) : 0;
  }

  off(): number {
    const p = this.product();
    return p ? discountPercent(p) : 0;
  }

  money(v: number): string {
    return rupees(v);
  }

  isBuyer(): boolean {
    return this.auth.role() === 'BUYER';
  }

  isOwner(): boolean {
    const p = this.product();
    return !!p && p.sellerId === this.auth.user()?.userId;
  }

  sellerLabel(): string {
    const p = this.product();
    return p?.sellerId ? `Seller #${p.sellerId}` : 'QuickMart';
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    if (!this.isBuyer()) {
      this.router.navigate(['/login'], { queryParams: { next: `/product/${p.id}` } });
      return;
    }
    this.cart.add(p.id, this.qty());
    this.toast.success(`${p.name} added to cart`);
  }

  buyNow(): void {
    const p = this.product();
    if (!p) return;
    if (!this.isBuyer()) {
      this.router.navigate(['/login'], { queryParams: { next: `/product/${p.id}` } });
      return;
    }
    this.orderApi.create({ items: [{ productId: p.id, quantity: this.qty() }] }).subscribe({
      next: (order) => this.router.navigate(['/payment', order.id]),
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to place order')
    });
  }

  dec(): void {
    if (this.qty() > 1) this.qty.set(this.qty() - 1);
  }

  inc(): void {
    const p = this.product();
    if (p && this.qty() < p.stockQty) this.qty.set(this.qty() + 1);
  }
}