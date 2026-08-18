import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models';
import { rupees } from '../../utils';

export type PaymentResultStatus = 'success' | 'failed' | 'cancelled';

@Component({
  selector: 'app-payment-result',
  imports: [RouterLink],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.scss'
})
export class PaymentResult {
  private readonly ordersApi = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly status = signal<PaymentResultStatus>('success');
  readonly message = signal<string | null>(null);
  readonly orderId = signal<number | null>(null);
  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);

  readonly isSuccess = computed(() => this.status() === 'success');
  readonly isFailed = computed(() => this.status() === 'failed');
  readonly isCancelled = computed(() => this.status() === 'cancelled');

  readonly heading = computed(() => {
    switch (this.status()) {
      case 'success':
        return 'Payment successful!';
      case 'cancelled':
        return 'Payment not completed';
      default:
        return 'Payment failed';
    }
  });

  readonly subtext = computed(() => {
    if (this.message()) return this.message()!;
    switch (this.status()) {
      case 'success':
        return 'Your order has been placed and is being processed.';
      case 'cancelled':
        return 'You closed the payment window before finishing. No amount was charged.';
      default:
        return 'Something went wrong while processing your payment. No amount was charged, or it will be automatically refunded.';
    }
  });

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    const status = params.get('status') as PaymentResultStatus | null;
    this.status.set(status === 'failed' || status === 'cancelled' ? status : 'success');
    this.message.set(params.get('message'));
    const orderId = params.get('orderId');
    this.orderId.set(orderId ? Number(orderId) : null);

    if (this.orderId()) {
      this.ordersApi.get(this.orderId()!).subscribe({
        next: (o) => {
          this.order.set(o);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  money(v: number): string {
    return rupees(v);
  }

  retryPayment(): void {
    if (this.orderId()) {
      this.router.navigate(['/checkout'], { queryParams: { order: this.orderId() } });
    } else {
      this.router.navigate(['/cart']);
    }
  }

  viewOrder(): void {
    if (this.orderId()) {
      this.router.navigate(['/orders', this.orderId(), 'tracking']);
    } else {
      this.router.navigate(['/orders']);
    }
  }
}
