import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  private readonly auth = inject(AuthService);
  private readonly ordersApi = inject(OrderService);

  readonly user = this.auth.user;
  readonly orderCount = signal<number | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.auth.me().subscribe({ error: () => undefined });
    this.ordersApi.myOrders().subscribe({
      next: (orders) => {
        this.orderCount.set(orders.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  initial(): string {
    return (this.user()?.name || '?').charAt(0).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}
