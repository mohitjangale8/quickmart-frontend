import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { imageFor, rupees } from '../../utils';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly orderApi = inject(OrderService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly items = this.cart.items;
  readonly subtotal = this.cart.subtotal;
  readonly count = this.cart.count;

  readonly placing = signal(false);

  readonly isBuyer = this.auth.role;

  money(v: number): string {
    return rupees(v);
  }

  image(item: { imageUrl?: string }): string | null {
    return imageFor(item as never);
  }

  initial(item: { brand?: string; name: string }): string {
    return (item.brand || item.name).charAt(0).toUpperCase();
  }

  setQty(itemId: number, quantity: number, max: number): void {
    if (quantity < 1 || quantity > max) return;
    this.cart.setQuantity(itemId, quantity);
  }

  remove(itemId: number): void {
    this.cart.remove(itemId);
    this.toast.info('Item removed from cart');
  }

  placeOrder(): void {
    if (this.isBuyer() !== 'BUYER') {
      this.router.navigate(['/login'], { queryParams: { next: '/cart' } });
      return;
    }
    const items = this.items().map((i) => ({ productId: i.productId, quantity: i.quantity }));
    if (items.length === 0) return;

    this.placing.set(true);
    this.orderApi.create({ items }).subscribe({
      next: (order) => {
        this.placing.set(false);
        this.cart.clear();
        this.router.navigate(['/payment', order.id]);
      },
      error: (err) => {
        this.placing.set(false);
        this.toast.error(err.error?.message ?? 'Failed to place order');
      }
    });
  }
}