import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Order, Product } from '../../models';
import { imageFor, rupees } from '../../utils';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private readonly productsApi = inject(ProductService);
  private readonly ordersApi = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly products = signal<Product[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly sellerId = this.auth.user;

  readonly stats = computed(() => {
    const products = this.products();
    const orders = this.orders();
    return {
      products: products.length,
      stock: products.reduce((s, p) => s + p.stockQty, 0),
      pending: orders.filter((o) => o.status === 'PENDING').length,
      paid: orders.filter((o) => o.status === 'PAID').length,
      shipped: orders.filter((o) => o.status === 'SHIPPED').length,
      revenue: orders.filter((o) => o.status === 'PAID' || o.status === 'SHIPPED')
        .reduce((s, o) => s + o.totalAmount, 0)
    };
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productsApi.list({ size: 100 }).subscribe({
      next: (page) => {
        const mine = page.content.filter((p) => p.sellerId === this.sellerId()?.userId);
        this.products.set(mine);
      },
      error: (err) => this.error.set(err.error?.message ?? 'Failed to load products')
    });
    this.ordersApi.myOrders().subscribe({
      next: (orders) => this.orders.set(orders),
      error: () => undefined,
      complete: () => this.loading.set(false)
    });
  }

  money(v: number): string {
    return rupees(v);
  }

  image(p: Product): string | null {
    return imageFor(p);
  }

  deleteProduct(p: Product): void {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    this.productsApi.delete(p.id).subscribe({
      next: () => {
        this.toast.success(`"${p.name}" deleted`);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Delete failed')
    });
  }

  canShip(order: Order): boolean {
    return order.status === 'PAID' && order.items.some((i) => i.sellerId === this.sellerId()?.userId);
  }

  ship(order: Order): void {
    this.ordersApi.ship(order.id).subscribe({
      next: () => {
        this.toast.success(`Order #${order.id} shipped`);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to ship order')
    });
  }
}