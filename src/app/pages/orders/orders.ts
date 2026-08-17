import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Order } from '../../models';
import { DatePipe } from '@angular/common';
import { imageFor, rupees } from '../../utils';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, DatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders {
  private readonly ordersApi = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly role = this.auth.role;
  readonly sellerId = this.auth.user;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.ordersApi.myOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to load orders');
        this.loading.set(false);
      }
    });
  }

  money(v: number): string {
    return rupees(v);
  }

  image(item: { imageUrl?: string }): string | null {
    return imageFor(item as never);
  }

  initial(item: { brand?: string; productName: string }): string {
    return (item.brand || item.productName).charAt(0).toUpperCase();
  }

  canShip(order: Order): boolean {
    return this.role() === 'SELLER' && order.status === 'PAID' && order.items.some((i) => i.sellerId === this.sellerId()?.userId);
  }

  isSellerItem(item: { sellerId: number }): boolean {
    return this.role() === 'SELLER' && item.sellerId === this.sellerId()?.userId;
  }

  ship(order: Order): void {
    this.ordersApi.ship(order.id).subscribe({
      next: () => {
        this.toast.success(`Order #${order.id} marked as shipped`);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to ship order')
    });
  }

  pay(order: Order): void {
    this.router.navigate(['/checkout'], { queryParams: { order: order.id } });
  }

  track(order: Order): void {
    this.router.navigate(['/orders', order.id, 'tracking']);
  }

  canTrack(order: Order): boolean {
    return !!(order.trackingStatus || order.status === 'PAID' || order.status === 'SHIPPED');
  }

  canReturn(order: Order): boolean {
    return this.role() === 'BUYER' && order.trackingStatus === 'DELIVERED' && !order.returnStatus;
  }

  orderTrackingStatusLabel(status: string | null): string {
    if (!status) return 'Not started';
    return status.replace('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
  }
}