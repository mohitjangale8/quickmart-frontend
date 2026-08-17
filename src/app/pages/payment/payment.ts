import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '../../services/toast.service';
import { Order } from '../../models';
import { rupees } from '../../utils';

type PayMethod = 'UPI' | 'Card' | 'NetBanking' | 'Wallet';

@Component({
  selector: 'app-payment',
  imports: [RouterLink],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment {
  private readonly ordersApi = inject(OrderService);
  private readonly paymentsApi = inject(PaymentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly paying = signal(false);
  readonly done = signal(false);
  readonly method = signal<PayMethod>('UPI');
  readonly error = signal<string | null>(null);

  readonly methods: { id: PayMethod; label: string; icon: string }[] = [
    { id: 'UPI', label: 'UPI', icon: '&#128241;' },
    { id: 'Card', label: 'Credit / Debit Card', icon: '&#128179;' },
    { id: 'NetBanking', label: 'Net Banking', icon: '&#127970;' },
    { id: 'Wallet', label: 'Wallet', icon: '&#128176;' }
  ];

  constructor() {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    this.ordersApi.get(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
        if (order.status !== 'PENDING') {
          this.error.set('This order is not pending payment.');
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Order not found');
        this.loading.set(false);
      }
    });
  }

  money(v: number): string {
    return rupees(v);
  }

  pay(): void {
    const order = this.order();
    if (!order || this.paying()) return;
    this.paying.set(true);
    this.error.set(null);

    this.paymentsApi.checkout(order.id)
      .pipe(finalize(() => this.paying.set(false)))
      .subscribe({
        next: (checkout) => {
          this.paymentsApi.confirm(checkout.paymentId).subscribe({
            next: () => {
              this.done.set(true);
              this.toast.success(`Payment of ${this.money(order.totalAmount)} successful`);
              setTimeout(() => this.router.navigate(['/orders']), 1800);
            },
            error: (err) => this.error.set(err.error?.message ?? 'Payment failed')
          });
        },
        error: (err) => this.error.set(err.error?.message ?? 'Checkout failed')
      });
  }
}